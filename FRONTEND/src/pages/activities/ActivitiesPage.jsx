import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useQuery from "../../hooks/useQuery";
import {
  API_DEALS_LIST,
  API_CONTACTS_LIST,
  API_ACTIVITIES_LIST,
} from "../../imports/api";
import { Card, CardContent } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { CalendarIcon, SearchIcon } from "lucide-react";
import ActivityList from "../../components/activities/ActivityList";
// Removed ActivityForm import as we're using a dedicated page now
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { generateParam } from "../../hooks/useQuery";

const ActivitiesPage = () => {
  const navigate = useNavigate();
  // Removed isCreateModalOpen state as we're using a dedicated page now
  const [filters, setFilters] = useState({
    type: "",
    deal_id: "",
    contact_id: "",
    date: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [queryParams, setQueryParams] = useState({});

  // Fetch deals for filter dropdown
  const { data: dealsData } = useQuery(API_DEALS_LIST);

  // Fetch contacts for filter dropdown
  const { data: contactsData } = useQuery(API_CONTACTS_LIST);

  const deals = dealsData?.data?.data?.deals || [];
  const contacts = contactsData?.data?.data?.contacts || [];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      type: "",
      deal_id: "",
      contact_id: "",
      date: null,
    });
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  // Build query params for ActivityList based on filters and search
  const buildQueryParams = useCallback(() => {
    const params = {};

    if (filters.type && filters.type !== "all") params.type = filters.type;
    if (filters.deal_id && filters.deal_id !== "all")
      params.deal_id = filters.deal_id;
    if (filters.contact_id && filters.contact_id !== "all")
      params.contact_id = filters.contact_id;
    if (filters.date) {
      const date = new Date(filters.date);
      params.date = format(date, "yyyy-MM-dd");
    }
    if (debouncedSearchQuery) params.search = debouncedSearchQuery;

    return params;
  }, [filters, debouncedSearchQuery]);

  // Update query params when filters or search change
  useEffect(() => {
    setQueryParams(buildQueryParams());
  }, [buildQueryParams]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activities</h1>
        <Button onClick={() => navigate("/activities/new")}>
          Log Activity
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="type-filter">Activity Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-filter">Deal</Label>
              <Select
                value={filters.deal_id}
                onValueChange={(value) => handleFilterChange("deal_id", value)}
              >
                <SelectTrigger id="deal-filter">
                  <SelectValue placeholder="All Deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal._id} value={deal._id}>
                      {deal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-filter">Contact</Label>
              <Select
                value={filters.contact_id}
                onValueChange={(value) =>
                  handleFilterChange("contact_id", value)
                }
              >
                <SelectTrigger id="contact-filter">
                  <SelectValue placeholder="All Contacts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact._id} value={contact._id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="date-filter">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-filter"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date ? format(filters.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.date}
                    onSelect={(date) => handleFilterChange("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div> */}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end mb-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search activities..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && searchQuery !== debouncedSearchQuery && (
                  <div className="absolute right-2.5 top-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="shrink-0 text-foreground hover:text-foreground"
            >
              Clear Filters
            </Button>
          </div>

          {/* <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="type-filter">Activity Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deal-filter">Deal</Label>
                  <Select
                    value={filters.deal_id}
                    onValueChange={(value) =>
                      handleFilterChange("deal_id", value)
                    }
                  >
                    <SelectTrigger id="deal-filter">
                      <SelectValue placeholder="All Deals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Deals</SelectItem>
                      {deals.map((deal) => (
                        <SelectItem key={deal._id} value={deal._id}>
                          {deal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-filter">Contact</Label>
                  <Select
                    value={filters.contact_id}
                    onValueChange={(value) =>
                      handleFilterChange("contact_id", value)
                    }
                  >
                    <SelectTrigger id="contact-filter">
                      <SelectValue placeholder="All Contacts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem key={contact._id} value={contact._id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-filter">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-filter"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.date
                          ? format(filters.date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.date}
                        onSelect={(date) => handleFilterChange("date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search activities..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && searchQuery !== debouncedSearchQuery && (
                      <div className="absolute right-2.5 top-2.5">
                        <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="shrink-0 text-foreground hover:text-foreground"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Activity list */}
          {Object.keys(queryParams).length > 0 ? (
            <ActivityList
              apiUrl={`${API_ACTIVITIES_LIST}?${generateParam(queryParams)}`}
            />
          ) : (
            <ActivityList apiUrl={API_ACTIVITIES_LIST} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivitiesPage;
