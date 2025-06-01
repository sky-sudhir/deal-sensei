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

// Contacts Management
import ContactsPage from "./contacts/ContactsPage";
import ContactDetailPage from "./contacts/ContactDetailPage";

// Deals Management
import DealsPage from "./deals/DealsPage";
import DealDetailPage from "./deals/DealDetailPage";
import CreateDealPage from "./deals/CreateDealPage";
import EditDealPage from "./deals/EditDealPage";

// Activities Management
import ActivitiesPage from "./activities/ActivitiesPage";
import CreateActivityPage from "./activities/CreateActivityPage";
import EditActivityPage from "./activities/EditActivityPage";

// Files Management
import FilesPage from "./files/FilesPage";

// AI Tools
import AiToolsPage from "./ai/AiToolsPage";

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

  /* Contacts Management */
  <Route key="contacts" path="contacts" element={<ContactsPage />} />,
  <Route key="contact-detail" path="contacts/:id" element={<ContactDetailPage />} />,

  /* Deals Management */
  <Route key="deals" path="deals" element={<DealsPage />} />,
  <Route key="deal-detail" path="deals/:id" element={<DealDetailPage />} />,
  <Route key="create-deal" path="deals/new" element={<CreateDealPage />} />,
  <Route key="edit-deal" path="deals/:id/edit" element={<EditDealPage />} />,

  /* Activities Management */
  <Route key="activities" path="activities" element={<ActivitiesPage />} />,
  <Route key="create-activity" path="activities/new" element={<CreateActivityPage />} />,
  <Route key="edit-activity" path="activities/:id/edit" element={<EditActivityPage />} />,

  /* Files Management */
  <Route key="files" path="files" element={<FilesPage />} />,

  /* AI Tools */
  <Route key="ai-tools" path="ai-tools" element={<AiToolsPage />} />,

  /* Default Route */
  <Route key="default" path="*" element={<Navigate to="/dashboard" />} />,

];

export default HomeRoutes;
