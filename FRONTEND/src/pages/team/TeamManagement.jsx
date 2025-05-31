import React, { useState } from "react";
import useQuery from "../../hooks/useQuery";
import useMutation from "../../hooks/useMutation";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Plus, Pencil, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { useSelector } from "react-redux";
import InviteUserForm from "./InviteUserForm";
import EditUserForm from "./EditUserForm";
import { API_USERS_LIST, API_USER_DEACTIVATE } from "../../imports/api";
import { selectUser } from "@/redux/features/user/userSlice";

const TeamManagement = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const currentUser = useSelector(selectUser);
  const isAdmin = currentUser?.role === "admin";
  console.log(isAdmin, "currentUser");

  // Fetch team members
  const {
    data: usersResponse,
    loading,
    error,
    refetch,
  } = useQuery(`${API_USERS_LIST}?showInactive=${showInactive}`);
  const users = usersResponse?.data?.data || [];

  // Deactivate user mutation
  const { mutate: deactivateUser, loading: deactivateLoading } = useMutation();

  const handleInviteSuccess = () => {
    setIsInviteDialogOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    refetch();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeactivate = async (id) => {
    const result = await deactivateUser({
      url: API_USER_DEACTIVATE.replace("{id}", id),
      method: "PUT",
    });

    if (result.success) {
      refetch();
    }
  };

  const toggleShowInactive = () => {
    setShowInactive(!showInactive);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading team members...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        Error loading team members. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <div className="flex space-x-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={toggleShowInactive}>
                {!showInactive ? "Hide Inactive Users" : "Show Inactive Users"}
              </Button>

              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </>
          )}
          {isAdmin && (
            <Dialog
              open={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <InviteUserForm onSuccess={handleInviteSuccess} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {users?.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No team members found</h3>
          <p className="text-muted-foreground mb-4">
            Invite your first team member to get started
          </p>
          {isAdmin && (
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((user) => (
            <Card
              key={user._id}
              className={!user.is_active ? "opacity-70" : ""}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role === "admin" ? "Admin" : "Sales Rep"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      user.is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-muted-foreground">
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardContent>
              {isAdmin && user._id !== currentUser?._id && (
                <CardFooter className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {user.is_active && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will deactivate the user's account. They will
                            no longer be able to access the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeactivate(user._id)}
                          >
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent
            className="sm:max-w-[500px]"
            onClose={() => setIsEditDialogOpen(false)}
          >
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            <EditUserForm user={selectedUser} onSuccess={handleEditSuccess} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamManagement;
