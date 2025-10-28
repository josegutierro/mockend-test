"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
  Selection,
} from "@heroui/react";
import { useCallback, useMemo, useState } from "react";

const moduleCatalog = [
  { key: "inventory", label: "Inventory Tracking", description: "Monitor and reconcile inbound and outbound inventory." },
  { key: "billing", label: "Billing Automation", description: "Generate invoices and manage accounts receivable." },
  { key: "analytics", label: "Performance Analytics", description: "Insights into throughput, dwell time, and utilization." },
  { key: "alerts", label: "Exception Alerts", description: "Proactive notifications for SLA breaches and anomalies." },
] as const;

type ModuleKey = (typeof moduleCatalog)[number]["key"];
type FacilityStatus = "Active" | "Pending" | "Inactive";
type BillingCycle = "Monthly" | "Quarterly" | "Annually";
type BillingStatus = "Active" | "Upcoming" | "Expired";

type Facility = {
  id: string;
  name: string;
  status: FacilityStatus;
  enrollmentDate: string;
  modules: Record<ModuleKey, boolean>;
};

type BillingPeriod = {
  facilityId: string;
  startDate: string;
  cycle: BillingCycle;
  status: BillingStatus;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  facilities: string[];
  role: "Owner" | "Manager" | "Viewer";
  notes?: string;
};

const defaultModules: Record<ModuleKey, boolean> = moduleCatalog.reduce(
  (acc, module) => ({ ...acc, [module.key]: module.key === "inventory" || module.key === "billing" }),
  {} as Record<ModuleKey, boolean>
);

const createEmptyFacilityForm = (): Facility => ({
  id: "",
  name: "",
  status: "Pending",
  enrollmentDate: new Date().toISOString().slice(0, 10),
  modules: { ...defaultModules },
});

const createEmptyBillingDraft = (facilityId = ""): BillingPeriod => ({
  facilityId,
  startDate: new Date().toISOString().slice(0, 10),
  cycle: "Monthly",
  status: "Active",
});

const createEmptyAdminForm = (): AdminUser => ({
  id: "",
  name: "",
  email: "",
  facilities: [],
  role: "Viewer",
  notes: "",
});

export default function DashboardPage() {
  const [facilitySearch, setFacilitySearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: "stl-north",
      name: "Stowlog STL North",
      status: "Active",
      enrollmentDate: "2023-08-14",
      modules: { ...defaultModules, analytics: true },
    },
    {
      id: "atl-south",
      name: "Stowlog ATL South",
      status: "Active",
      enrollmentDate: "2023-11-02",
      modules: { ...defaultModules, alerts: true },
    },
    {
      id: "mia-hub",
      name: "Stowlog Miami Hub",
      status: "Pending",
      enrollmentDate: "2024-02-20",
      modules: { ...defaultModules, analytics: false, alerts: false },
    },
  ]);

  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>([
    { facilityId: "stl-north", startDate: "2024-01-01", cycle: "Monthly", status: "Active" },
    { facilityId: "atl-south", startDate: "2023-12-01", cycle: "Quarterly", status: "Active" },
    { facilityId: "mia-hub", startDate: "2024-05-01", cycle: "Monthly", status: "Upcoming" },
  ]);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: "alice-cooper",
      name: "Alice Cooper",
      email: "alice@stowlog.com",
      facilities: ["stl-north", "atl-south"],
      role: "Owner",
      notes: "North region operations lead",
    },
    {
      id: "brian-orr",
      name: "Brian Orr",
      email: "brian@stowlog.com",
      facilities: ["atl-south"],
      role: "Manager",
      notes: "Regional billing oversight",
    },
    {
      id: "carla-wong",
      name: "Carla Wong",
      email: "carla@stowlog.com",
      facilities: ["mia-hub"],
      role: "Viewer",
      notes: "Implementation specialist",
    },
  ]);

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("stl-north");
  const [moduleDraft, setModuleDraft] = useState<Record<ModuleKey, boolean>>(
    facilities[0]?.modules ?? { ...defaultModules }
  );

  const [facilityForm, setFacilityForm] = useState<Facility>(createEmptyFacilityForm());
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);

  const facilityModal = useDisclosure();
  const billingModal = useDisclosure();
  const adminModal = useDisclosure();

  const [billingDraft, setBillingDraft] = useState<BillingPeriod>(createEmptyBillingDraft());

  const [adminForm, setAdminForm] = useState<AdminUser>(createEmptyAdminForm());
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);

  const resetFacilityForm = useCallback(() => {
    setFacilityForm(createEmptyFacilityForm());
    setEditingFacilityId(null);
  }, []);

  const filteredFacilities = useMemo(() => {
    const search = facilitySearch.trim().toLowerCase();
    if (!search) return facilities;
    return facilities.filter((facility) =>
      [facility.name, facility.status, facility.enrollmentDate]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [facilities, facilitySearch]);

  const filteredAdmins = useMemo(() => {
    const search = adminSearch.trim().toLowerCase();
    if (!search) return adminUsers;
    return adminUsers.filter((admin) =>
      [admin.name, admin.email, admin.role]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [adminSearch, adminUsers]);

  const selectedFacility = facilities.find((facility) => facility.id === selectedFacilityId);

  const openCreateFacility = () => {
    resetFacilityForm();
    facilityModal.onOpen();
  };

  const openEditFacility = (facility: Facility) => {
    setFacilityForm({ ...facility, modules: { ...facility.modules } });
    setEditingFacilityId(facility.id);
    facilityModal.onOpen();
  };

  const handleFacilitySubmit = (onClose?: () => void) => {
    if (!facilityForm.name.trim()) {
      return;
    }

    if (editingFacilityId) {
      setFacilities((prev) =>
        prev.map((facility) =>
          facility.id === editingFacilityId ? { ...facility, ...facilityForm } : facility
        )
      );
      if (selectedFacilityId === editingFacilityId) {
        setModuleDraft({ ...facilityForm.modules });
      }
    } else {
      const id = facilityForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const newFacility: Facility = { ...facilityForm, id };
      setFacilities((prev) => [...prev, newFacility]);
      setBillingPeriods((prev) => [
        ...prev,
        {
          facilityId: id,
          startDate: facilityForm.enrollmentDate,
          cycle: "Monthly",
          status: "Upcoming",
        },
      ]);
      setSelectedFacilityId(id);
      setModuleDraft({ ...facilityForm.modules });
    }
    onClose?.();
    resetFacilityForm();
  };

  const handleDeleteFacility = (facilityId: string) => {
    setFacilities((prev) => {
      const updated = prev.filter((facility) => facility.id !== facilityId);
      if (selectedFacilityId === facilityId) {
        if (updated.length) {
          setSelectedFacilityId(updated[0].id);
          setModuleDraft({ ...updated[0].modules });
        } else {
          setSelectedFacilityId("");
          setModuleDraft({ ...defaultModules });
        }
      }
      return updated;
    });
    setBillingPeriods((prev) => prev.filter((period) => period.facilityId !== facilityId));
    setAdminUsers((prev) =>
      prev.map((admin) => ({
        ...admin,
        facilities: admin.facilities.filter((id) => id !== facilityId),
      }))
    );
  };

  const handleModuleChange = (module: ModuleKey, enabled: boolean) => {
    setModuleDraft((prev) => ({ ...prev, [module]: enabled }));
  };

  const handleSaveModules = () => {
    if (!selectedFacility) return;
    setFacilities((prev) =>
      prev.map((facility) =>
        facility.id === selectedFacility.id ? { ...facility, modules: { ...moduleDraft } } : facility
      )
    );
  };

  const openBillingModal = (facilityId: string) => {
    const existing = billingPeriods.find((period) => period.facilityId === facilityId);
    setBillingDraft(
      existing ?? {
        facilityId,
        startDate: new Date().toISOString().slice(0, 10),
        cycle: "Monthly",
        status: "Active",
      }
    );
    billingModal.onOpen();
  };

  const handleBillingSubmit = (onClose?: () => void) => {
    setBillingPeriods((prev) => {
      const hasExisting = prev.some((period) => period.facilityId === billingDraft.facilityId);
      if (hasExisting) {
        return prev.map((period) =>
          period.facilityId === billingDraft.facilityId ? { ...billingDraft } : period
        );
      }
      return [...prev, billingDraft];
    });
    onClose?.();
  };

  const openCreateAdmin = () => {
    setAdminForm(createEmptyAdminForm());
    setEditingAdminId(null);
    adminModal.onOpen();
  };

  const openEditAdmin = (admin: AdminUser) => {
    setAdminForm({ ...admin, facilities: [...admin.facilities] });
    setEditingAdminId(admin.id);
    adminModal.onOpen();
  };

  const handleAdminSubmit = (onClose?: () => void) => {
    if (!adminForm.name.trim() || !adminForm.email.trim()) {
      return;
    }

    if (editingAdminId) {
      setAdminUsers((prev) =>
        prev.map((admin) => (admin.id === editingAdminId ? { ...adminForm } : admin))
      );
    } else {
      const id = adminForm.email.split("@")[0].replace(/[^a-z0-9]+/g, "-");
      setAdminUsers((prev) => [...prev, { ...adminForm, id }]);
    }
    onClose?.();
  };

  const handleRemoveAdmin = (adminId: string) => {
    setAdminUsers((prev) => prev.filter((admin) => admin.id !== adminId));
  };

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Stowlog Internal Dashboard</h1>
          <p className="text-default-500">
            Operational cockpit to manage facility enrollment, module configuration, billing cadence, and admin access.
          </p>
        </header>
        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Facilities Management</h2>
              <p className="text-small text-default-500">
                Review onboarding status, module availability, and enrollment timelines for each facility.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
              <Input
                className="lg:w-64"
                label="Search facilities"
                placeholder="Search by name, status, or date"
                value={facilitySearch}
                onValueChange={setFacilitySearch}
                isClearable
              />
              <Button color="primary" onPress={openCreateFacility}>
                Add New Facility
              </Button>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="overflow-x-auto">
            <Table aria-label="Facilities table" removeWrapper>
              <TableHeader>
                <TableColumn>Name</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Enrollment Date</TableColumn>
                <TableColumn>Active Modules</TableColumn>
                <TableColumn align="center">Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No facilities found" items={filteredFacilities}>
                {(facility) => (
                  <TableRow key={facility.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{facility.name}</span>
                        <span className="text-tiny text-default-500">{facility.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={facility.status === "Active" ? "success" : facility.status === "Pending" ? "warning" : "default"}
                        variant="flat"
                      >
                        {facility.status}
                      </Chip>
                    </TableCell>
                    <TableCell>{new Date(facility.enrollmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {moduleCatalog
                          .filter((module) => facility.modules[module.key])
                          .map((module) => (
                            <Chip key={module.key} color="primary" variant="flat" size="sm">
                              {module.label}
                            </Chip>
                          ))}
                        {moduleCatalog.every((module) => !facility.modules[module.key]) && (
                          <span className="text-tiny text-default-400">No modules enabled</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" onPress={() => openEditFacility(facility)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDeleteFacility(facility.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Facility Configuration</h2>
              <p className="text-small text-default-500">
                Toggle operational modules and push updates to connected systems for the selected facility.
              </p>
            </div>
            <Select
              label="Selected facility"
              selectedKeys={selectedFacilityId ? new Set([selectedFacilityId]) : new Set([])}
              className="lg:w-72"
              onSelectionChange={(keys: Selection) => {
                const next = Array.from(keys).at(0)?.toString();
                if (!next) return;
                setSelectedFacilityId(next);
                const facility = facilities.find((item) => item.id === next);
                if (facility) {
                  setModuleDraft({ ...facility.modules });
                }
              }}
            >
              {facilities.map((facility) => (
                <SelectItem key={facility.id} value={facility.id} description={`Status: ${facility.status}`}>
                  {facility.name}
                </SelectItem>
              ))}
            </Select>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {selectedFacility ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {moduleCatalog.map((module) => (
                  <Card key={module.key} className="border border-default-100 bg-content1">
                    <CardHeader className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{module.label}</h3>
                        <p className="text-small text-default-500">{module.description}</p>
                      </div>
                      <Switch
                        isSelected={moduleDraft[module.key]}
                        onValueChange={(value) => handleModuleChange(module.key, value)}
                        color="primary"
                      />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-default-500">Select a facility to manage its modules.</p>
            )}
            <div className="flex justify-end">
              <Button color="primary" onPress={handleSaveModules} isDisabled={!selectedFacility}>
                Save Configuration
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Billing Period Management</h2>
              <p className="text-small text-default-500">
                Track billing windows and update cycles for each enrolled facility.
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="overflow-x-auto">
            <Table aria-label="Billing table" removeWrapper>
              <TableHeader>
                <TableColumn>Facility</TableColumn>
                <TableColumn>Start Date</TableColumn>
                <TableColumn>Cycle</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn align="center">Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No billing periods" items={billingPeriods}>
                {(period) => {
                  const facility = facilities.find((item) => item.id === period.facilityId);
                  return (
                    <TableRow key={period.facilityId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{facility?.name ?? period.facilityId}</span>
                          <span className="text-tiny text-default-500">{period.facilityId}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(period.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{period.cycle}</TableCell>
                      <TableCell>
                        <Chip
                          color={
                            period.status === "Active"
                              ? "success"
                              : period.status === "Upcoming"
                              ? "primary"
                              : "default"
                          }
                          variant="flat"
                        >
                          {period.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="flat" onPress={() => openBillingModal(period.facilityId)}>
                          Set Billing Period
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Admin Users Management</h2>
              <p className="text-small text-default-500">
                Maintain trusted access and facility assignments for operations personnel.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
              <Input
                className="lg:w-64"
                label="Search admins"
                placeholder="Search by name, email, or role"
                value={adminSearch}
                onValueChange={setAdminSearch}
                isClearable
              />
              <Button color="primary" onPress={openCreateAdmin}>
                Add Admin User
              </Button>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="overflow-x-auto">
            <Table aria-label="Admin table" removeWrapper>
              <TableHeader>
                <TableColumn>Name</TableColumn>
                <TableColumn>Email</TableColumn>
                <TableColumn>Facilities</TableColumn>
                <TableColumn>Role</TableColumn>
                <TableColumn>Notes</TableColumn>
                <TableColumn align="center">Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No admin users" items={filteredAdmins}>
                {(admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{admin.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {admin.facilities.map((facilityId) => {
                          const facility = facilities.find((item) => item.id === facilityId);
                          return (
                            <Chip key={facilityId} color="secondary" variant="flat" size="sm">
                              {facility?.name ?? facilityId}
                            </Chip>
                          );
                        })}
                        {admin.facilities.length === 0 && (
                          <span className="text-tiny text-default-400">No facilities assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip variant="flat" color={admin.role === "Owner" ? "primary" : admin.role === "Manager" ? "warning" : "default"}>
                        {admin.role}
                      </Chip>
                    </TableCell>
                    <TableCell className="max-w-xs text-small text-default-500">
                      {admin.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" onPress={() => openEditAdmin(admin)}>
                          Edit
                        </Button>
                        <Button size="sm" color="danger" variant="light" onPress={() => handleRemoveAdmin(admin.id)}>
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </section>

      <Modal
        isOpen={facilityModal.isOpen}
        onOpenChange={(open) => {
          facilityModal.onOpenChange(open);
          if (!open) {
            resetFacilityForm();
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editingFacilityId ? "Edit Facility" : "Add New Facility"}</ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  autoFocus
                  label="Facility name"
                  placeholder="Facility name"
                  value={facilityForm.name}
                  onValueChange={(value) => setFacilityForm((prev) => ({ ...prev, name: value }))}
                />
                <Input
                  type="date"
                  label="Enrollment date"
                  value={facilityForm.enrollmentDate}
                  onValueChange={(value) => setFacilityForm((prev) => ({ ...prev, enrollmentDate: value }))}
                />
                <Select
                  label="Status"
                  selectedKeys={new Set([facilityForm.status])}
                  onSelectionChange={(keys: Selection) => {
                    const status = Array.from(keys).at(0) as FacilityStatus | undefined;
                    if (status) {
                      setFacilityForm((prev) => ({ ...prev, status }));
                    }
                  }}
                >
                  <SelectItem key="Active">Active</SelectItem>
                  <SelectItem key="Pending">Pending</SelectItem>
                  <SelectItem key="Inactive">Inactive</SelectItem>
                </Select>
                <div className="space-y-2">
                  <p className="text-small font-medium">Module access</p>
                  <div className="grid gap-3">
                    {moduleCatalog.map((module) => (
                      <div key={module.key} className="flex items-center justify-between gap-4 rounded-medium border border-default-100 bg-content1 px-3 py-2">
                        <div>
                          <p className="text-small font-medium">{module.label}</p>
                          <p className="text-tiny text-default-500">{module.description}</p>
                        </div>
                        <Switch
                          isSelected={facilityForm.modules[module.key]}
                          onValueChange={(value) =>
                            setFacilityForm((prev) => ({
                              ...prev,
                              modules: { ...prev.modules, [module.key]: value },
                            }))
                          }
                          color="primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={() => handleFacilitySubmit(onClose)}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={billingModal.isOpen}
        onOpenChange={(open) => {
          billingModal.onOpenChange(open);
          if (!open) {
            setBillingDraft(createEmptyBillingDraft());
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Set Billing Period</ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  label="Facility"
                  selectedKeys={billingDraft.facilityId ? new Set([billingDraft.facilityId]) : new Set([])}
                  onSelectionChange={(keys: Selection) => {
                    const facilityId = Array.from(keys).at(0)?.toString();
                    if (facilityId) {
                      setBillingDraft((prev) => ({ ...prev, facilityId }));
                    }
                  }}
                >
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id}>{facility.name}</SelectItem>
                  ))}
                </Select>
                <Input
                  type="date"
                  label="Billing start date"
                  value={billingDraft.startDate}
                  onValueChange={(value) => setBillingDraft((prev) => ({ ...prev, startDate: value }))}
                />
                <Select
                  label="Billing cycle"
                  selectedKeys={new Set([billingDraft.cycle])}
                  onSelectionChange={(keys: Selection) => {
                    const cycle = Array.from(keys).at(0) as BillingCycle | undefined;
                    if (cycle) {
                      setBillingDraft((prev) => ({ ...prev, cycle }));
                    }
                  }}
                >
                  <SelectItem key="Monthly">Monthly</SelectItem>
                  <SelectItem key="Quarterly">Quarterly</SelectItem>
                  <SelectItem key="Annually">Annually</SelectItem>
                </Select>
                <Select
                  label="Status"
                  selectedKeys={new Set([billingDraft.status])}
                  onSelectionChange={(keys: Selection) => {
                    const status = Array.from(keys).at(0) as BillingStatus | undefined;
                    if (status) {
                      setBillingDraft((prev) => ({ ...prev, status }));
                    }
                  }}
                >
                  <SelectItem key="Active">Active</SelectItem>
                  <SelectItem key="Upcoming">Upcoming</SelectItem>
                  <SelectItem key="Expired">Expired</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={() => handleBillingSubmit(onClose)} isDisabled={!billingDraft.facilityId}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={adminModal.isOpen}
        onOpenChange={(open) => {
          adminModal.onOpenChange(open);
          if (!open) {
            setAdminForm(createEmptyAdminForm());
            setEditingAdminId(null);
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editingAdminId ? "Edit Admin User" : "Add Admin User"}</ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  autoFocus
                  label="Name"
                  placeholder="Full name"
                  value={adminForm.name}
                  onValueChange={(value) => setAdminForm((prev) => ({ ...prev, name: value }))}
                />
                <Input
                  type="email"
                  label="Email"
                  placeholder="email@stowlog.com"
                  value={adminForm.email}
                  onValueChange={(value) => setAdminForm((prev) => ({ ...prev, email: value }))}
                />
                <Select
                  label="Role"
                  selectedKeys={new Set([adminForm.role])}
                  onSelectionChange={(keys: Selection) => {
                    const role = Array.from(keys).at(0) as AdminUser["role"] | undefined;
                    if (role) {
                      setAdminForm((prev) => ({ ...prev, role }));
                    }
                  }}
                >
                  <SelectItem key="Owner">Owner</SelectItem>
                  <SelectItem key="Manager">Manager</SelectItem>
                  <SelectItem key="Viewer">Viewer</SelectItem>
                </Select>
                <Select
                  label="Assigned facilities"
                  selectionMode="multiple"
                  selectedKeys={new Set(adminForm.facilities)}
                  onSelectionChange={(keys: Selection) => {
                    const selections = Array.from(keys).map((key) => key.toString());
                    setAdminForm((prev) => ({ ...prev, facilities: selections }));
                  }}
                >
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id}>{facility.name}</SelectItem>
                  ))}
                </Select>
                <Textarea
                  minRows={3}
                  label="Notes"
                  placeholder="Context about responsibilities or restrictions"
                  value={adminForm.notes ?? ""}
                  onValueChange={(value) => setAdminForm((prev) => ({ ...prev, notes: value }))}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={() => handleAdminSubmit(onClose)}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
