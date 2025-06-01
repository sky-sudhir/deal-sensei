import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Slider } from "../../components/ui/slider";
import useMutation from "../../hooks/useMutation";
import { Plus, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { API_PIPELINE_CREATE, API_PIPELINE_UPDATE } from "../../imports/api";
// Schema for pipeline validation
const pipelineSchema = yup.object({
  name: yup.string().required("Pipeline name is required"),
  is_default: yup.boolean(),
  stages: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required("Stage name is required"),
        win_probability: yup.number().min(0).max(100),
      })
    )
    .min(2, "Pipeline must have at least 2 stages"),
});

// Sortable item component for drag and drop
const SortableStage = ({ id, index, register, setValue, watch, remove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-2 p-4 bg-muted rounded-md mb-2"
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <Input
            {...register(`stages.${index}.name`)}
            placeholder="Stage name"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            disabled={watch("stages").length <= 2}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Win Probability</span>
            <span>{watch(`stages.${index}.win_probability`)}%</span>
          </div>
          <Slider
            value={[watch(`stages.${index}.win_probability`) || 0]}
            onValueChange={(value) => {
              setValue(`stages.${index}.win_probability`, value[0]);
            }}
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>
    </div>
  );
};

const PipelineForm = ({ pipeline, onSuccess }) => {
  const isEditing = !!pipeline;

  // Initialize form with default values or existing pipeline data
  const defaultValues = {
    name: pipeline?.name || "",
    is_default: pipeline?.is_default || false,
    stages: pipeline?.stages?.map((stage) => ({
      name: stage.name,
      win_probability: stage.win_probability || 0,
    })) || [
      { name: "Qualification", win_probability: 20 },
      { name: "Proposal", win_probability: 50 },
      { name: "Closed Won", win_probability: 100 },
    ],
  };

  const {
    register,
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(pipelineSchema),
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "stages",
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Create and update pipeline mutations
  const { mutate: createPipeline, loading: createLoading } = useMutation();
  const { mutate: updatePipeline, loading: updateLoading } = useMutation();

  const onSubmit = async (data) => {
    // Add order to stages based on their position
    const formattedData = {
      ...data,
      stages: data.stages.map((stage, index) => ({
        ...stage,
        order: index,
      })),
    };

    try {
      if (isEditing) {
        const result = await updatePipeline({
          url: `${API_PIPELINE_UPDATE}${pipeline._id}`,
          method: "PUT",
          data: formattedData,
        });

        if (result.success) {
          onSuccess();
        }
      } else {
        const result = await createPipeline({
          url: API_PIPELINE_CREATE,
          method: "POST",
          data: formattedData,
        });

        if (result.success) {
          onSuccess();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Pipeline Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is_default" {...register("is_default")} />
        <Label htmlFor="is_default">Set as default pipeline</Label>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Pipeline Stages</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", win_probability: 0 })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Stage
          </Button>
        </div>

        {errors.stages && (
          <p className="text-sm text-destructive">{errors.stages.message}</p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableStage
                key={field.id}
                id={field.id}
                stage={field}
                index={index}
                register={register}
                setValue={setValue}
                watch={watch}
                remove={remove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={createLoading || updateLoading}>
          {isEditing ? "Update Pipeline" : "Create Pipeline"}
        </Button>
      </div>
    </form>
  );
};

export default PipelineForm;
