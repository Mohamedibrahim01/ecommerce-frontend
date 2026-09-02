"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  MapPin,
  Plus,
  Star,
  CheckCircle2,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { api } from "@/src/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";

interface AddressData {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  // Addresses State
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
  });

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  useEffect(() => {
    if (isClient && accessToken) {
      fetchAddresses();
    }
  }, [isClient, accessToken]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get("/users/addresses");
      const data = response.data?.data || response.data;
      const fetchedAddresses = Array.isArray(data) ? data : data?.addresses || [];
      setAddresses(fetchedAddresses);
    } catch (error) {
      toast.error("Failed to load addresses.");
    }
  };

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/users/addresses", newAddress);
      toast.success("Address added successfully!");
      setIsAddModalOpen(false);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        isDefault: false,
      });
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to add address.");
    }
  }

  async function handleSetDefaultAddress(id: string) {
    try {
      await api.put(`/users/addresses/${id}/set-default`);
      toast.success("Default address updated!");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to update default address.");
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success("Address deleted successfully!");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address.");
    }
  }

  if (!isClient || !accessToken) return null;
  
  const egyptianGovernorates = [
    "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum",
    "Gharbia", "Ismailia", "Menofia", "Minya", "Qalyubia", "New Valley",
    "South Sinai", "Port Said", "Suez", "Sharqia", "Damietta", "North Sinai",
    "Beni Suef", "Luxor", "Aswan", "Matrouh", "Asyut", "Sohag", "Qena",
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4" dir="ltr">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-emerald-600" /> App Settings
        </h1>
        <p className="text-stone-500 text-sm mt-1">Manage your delivery locations.</p>
      </div>

      <div className="space-y-6">
        {/* Addresses Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Saved Addresses
            </h2>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Address
          </Button>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No addresses saved yet.
              </p>
            </div>
          ) : (
            addresses.map((addr) => (
              <Card
                key={addr.id}
                className={`relative overflow-hidden transition-all ${
                  addr.isDefault
                    ? "border-emerald-500 bg-emerald-50/30 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                }`}
              >
                {addr.isDefault && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" /> Default
                  </div>
                )}

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${addr.isDefault ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {addr.city}
                    </h3>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-900">
                        State:
                      </span>{" "}
                      {addr.state}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Street:
                      </span>{" "}
                      {addr.street}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Country:
                      </span>{" "}
                      {addr.country}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Zip:
                      </span>{" "}
                      {addr.zipCode}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex gap-2">
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="flex-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 font-semibold"
                      >
                        <Star className="h-4 w-4 mr-2" /> Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className={`text-gray-400 hover:text-red-600 hover:bg-red-50 ${addr.isDefault ? 'w-full' : ''}`}
                      title="Delete Address"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add New Address Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white shadow-xl rounded-2xl border-none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-bold">
                Add New Address
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase">
                      Country
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-md bg-gray-50 px-3 py-2 text-sm focus:outline-none border border-transparent focus:border-emerald-500"
                      value={newAddress.country}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          country: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="" disabled>
                        Select Country
                      </option>
                      <option value="Egypt">Egypt</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase">
                      State/Province
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-md bg-gray-50 px-3 py-2 text-sm focus:outline-none border border-transparent focus:border-emerald-500"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      required
                      disabled={!newAddress.country}
                    >
                      <option value="" disabled>
                        Select State
                      </option>
                      {newAddress.country === "Egypt" ? (
                        egyptianGovernorates.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))
                      ) : (
                        <option value="Other">Other</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase">
                      City
                    </Label>
                    <Input
                      placeholder="e.g., 6th of October"
                      className="bg-gray-50 border-none"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase">
                      Zip Code
                    </Label>
                    <Input
                      placeholder="e.g., 12566"
                      className="bg-gray-50 border-none"
                      value={newAddress.zipCode}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          zipCode: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 uppercase">
                    Street Address
                  </Label>
                  <Input
                    placeholder="e.g., 123 Main St, Apt 4"
                    className="bg-gray-50 border-none"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        isDefault: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label
                    htmlFor="isDefault"
                    className="text-sm font-semibold cursor-pointer"
                  >
                    Set as default address
                  </Label>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Save Address
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
