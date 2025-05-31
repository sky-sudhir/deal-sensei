import React from "react";
import { Route, Navigate } from "react-router-dom";

// Dashboard
import Dashboard from "./dashboard/Dashboard";

// Pipeline Management
import PipelineList from "./pipelines/PipelineList";
import CreatePipeline from "./pipelines/CreatePipeline";
import EditPipeline from "./pipelines/EditPipeline";

// Team Management
import TeamManagement from "./team/TeamManagement";

// Protected Routes for AppLayout
const HomeRoutes = [
  /* Dashboard */
  <Route key="dashboard" path="dashboard" element={<Dashboard />} />,
  <Route key="home" path="home" element={<Dashboard />} />,

  /* Pipeline Management */
  <Route key="pipelines" path="pipelines" element={<PipelineList />} />,
  <Route key="pipelines-create" path="pipelines/create" element={<CreatePipeline />} />,
  <Route key="pipelines-edit" path="pipelines/edit/:id" element={<EditPipeline />} />,

  /* Team Management */
  <Route key="team" path="team" element={<TeamManagement />} />,

  /* Default Route */
  <Route key="default" path="" element={<Navigate to="/dashboard" replace />} />,
];

export default HomeRoutes;
