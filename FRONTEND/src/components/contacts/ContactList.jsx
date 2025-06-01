import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash,
  Plus,
  Search,
  UserPlus,
  Briefcase,
} from "lucide-react";
import ContactForm from "./ContactForm";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";

const ContactList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const limit = 10;

  // Get user role from Redux store
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Fetch contacts with pagination and search
  const { data, loading, refetch } = useQuery(
    `api/v1/contacts?search=${searchTerm}&page=${currentPage}&limit=${limit}`
  );

  const contacts = data?.data?.data?.contacts || [];
  const pagination = data?.data?.data?.pagination || { total: 0, pages: 1 };

  // Setup mutation for delete
  const { mutate, loading: isDeleting } = useMutation();

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    refetch();
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const response = await mutate({
          url: `/api/v1/contacts/${contactId}`,
          method: "DELETE",
        });

        if (response.success) {
          refetch();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCreateDeal = (contactId) => {
    navigate(`/deals/new?contact=${contactId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Contacts</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Contact
        </Button>
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex w-full max-w-sm items-center space-x-2"
      >
        <Input
          type="search"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Contact list */}
      {loading ? (
        <div className="text-center py-10">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No contacts found. Add your first contact to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Card
              key={contact._id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/contacts/${contact._id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate">{contact.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditContact(contact)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCreateDeal(contact._id)}
                      >
                        <Briefcase className="mr-2 h-4 w-4" /> Create Deal
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" /> Transfer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteContact(contact._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="truncate">
                  {contact.last_interaction_date ? (
                    <span>
                      Last contacted:{" "}
                      {new Date(
                        contact.last_interaction_date
                      ).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>No recent interactions</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="truncate hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${contact.phone}`}
                        className="hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="w-full flex justify-between items-center">
                  {contact.engagement_score > 0 && (
                    <Badge
                      variant={
                        contact.engagement_score > 70
                          ? "success"
                          : contact.engagement_score > 30
                          ? "warning"
                          : "outline"
                      }
                    >
                      {contact.engagement_score}% Engaged
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateDeal(contact._id)}
                  >
                    <Briefcase className="mr-2 h-4 w-4" /> Create Deal
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Create Contact Modal */}
      {isCreateModalOpen && (
        <ContactForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Contact Modal */}
      {isEditModalOpen && selectedContact && (
        <ContactForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleCreateSuccess}
          initialData={selectedContact}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default ContactList;
