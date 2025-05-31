import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ManageTasks from "@/components/tasks/manageTasks";

function TaskRoutes() {
  return (
    <Routes>
      <Route path="" element={<ManageTasks />} />
      <Route path="*" element={<Navigate replace to="/404" />} />
    </Routes>
  );
}

export default TaskRoutes;
