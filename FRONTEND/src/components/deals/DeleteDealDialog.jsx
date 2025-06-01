import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useMutation from "@/hooks/useMutation";

const DeleteDealDialog = ({
  isOpen,
  onClose,
  dealId,
  dealTitle,
  onDeleteComplete,
}) => {
  const { mutate, loading } = useMutation();

  const handleDelete = async () => {
    try {
      const response = await mutate({
        url: `api/v1/deals/${dealId}`,
        method: "DELETE",
      });

      if (response.success) {
        onClose();
        if (onDeleteComplete) {
          onDeleteComplete();
        }
      }
    } catch (error) {
      console.error("Failed to delete deal:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Deal</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the deal "{dealTitle}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDealDialog;
