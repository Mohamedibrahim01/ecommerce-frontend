"use client";

import { useEffect, useState, useRef } from "react";
import {
  User, ShieldCheck, Save,
  Camera, Mail, Lock, Eye, EyeOff, RefreshCw, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/components/store/authStore";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { normalizeImageUrl } from "@/src/lib/utils";

type UserData = {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  isAdmin: boolean;
  isEmailConfirmed: boolean;
  createdAt: string;
};

function SkeletonProfile() {
  return (
    <div className="container-xl py-10 space-y-8" dir="ltr">
      <div className="skeleton h-8 w-40 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);

  // General Info Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Security Form State
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!accessToken) { router.replace("/login"); return; }
    fetchProfile();
  }, [accessToken, router]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      const data = res.data?.data || res.data;
      setUserData(data);
      setName(data.name || "");
      setEmail(data.email || "");
    } catch {
      toast.error("Failed to load profile data");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size too large. Please select an image under 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.put("/users/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      const newAvatarUrl = res.data?.data?.avatar || res.data?.avatar;

      setUserData((prev) => prev ? { ...prev, avatar: newAvatarUrl } : null);

      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.setState({ user: { ...user, avatar: newAvatarUrl } });
      }

      toast.success(res.data?.message || "Avatar uploaded successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }

    e.target.value = ""; // Reset input
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      const payload = { name, email };
      const res = await api.put("/users/profile", payload);
      const updatedUser = res.data?.data || res.data;

      setUserData((prev) => prev ? { ...prev, ...updatedUser } : null);
      setName(updatedUser.name || name);
      setEmail(updatedUser.email || email);

      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.setState({ user: { ...user, name: updatedUser.name, email: updatedUser.email } });
      }

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-]).{8,}$/;
    if (!pattern.test(password.newPassword)) {
      toast.error("Password must be at least 8 characters, include an uppercase letter, lowercase letter, number, and special character.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
        confirmNewPassword: password.confirmNewPassword,
      });
      toast.success(res.data?.message || res.data?.Message || "Password changed successfully!");
      setPassword({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.Message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!userData) return <SkeletonProfile />;

  return (
    <div className="min-h-screen bg-stone-50" dir="ltr">
      <div className="container-xl py-10 space-y-8 max-w-5xl mx-auto px-4">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">My Profile</h1>
            <p className="text-stone-500 text-sm mt-1">Manage your account information and security.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: Avatar Card ────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-24 sm:h-28 bg-gradient-to-r from-emerald-600 to-emerald-500 relative">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
                  aria-hidden="true"
                />
              </div>

              <div className="px-6 pb-6 -mt-14 sm:-mt-18 text-center">
                <div className="relative inline-block mx-auto">
                  <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden mx-auto">
                    {userData.avatar ? (
                      <img
                        src={normalizeImageUrl(userData.avatar)}
                        alt={`${userData.name}`}
                        className="h-full w-full rounded-full object-cover aspect-square"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-emerald-50 flex items-center justify-center">
                        <User className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-600" aria-hidden="true" />
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                        <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin" />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 sm:p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-2 border-white transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
                    aria-label="Upload profile photo"
                    title="Upload profile photo"
                  >
                    <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <h2 className="mt-3 text-lg font-black text-stone-900 flex items-center justify-center gap-1.5">
                  {userData.name}
                </h2>

                <Badge variant={userData.isAdmin ? "destructive" : "emerald"} className="mt-2 font-semibold">
                  {userData.isAdmin ? "Admin" : "Member"}
                </Badge>


              </div>
            </div>
          </div>

          {/* ── Right: Forms ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* General Information */}
            <Card className="bg-white border-stone-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-stone-100 bg-stone-50/50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  General Information
                </CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateInfo} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSavingInfo} className="bg-emerald-600 hover:bg-emerald-700 w-full mt-2">
                    {isSavingInfo ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security / Change Password */}
            <Card className="bg-white border-stone-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-stone-100 bg-stone-50/50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-emerald-600" />
                  Security
                </CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        type={showCurrent ? "text" : "password"}
                        value={password.currentPassword}
                        onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        type={showNew ? "text" : "password"}
                        value={password.newPassword}
                        onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        type={showConfirmNew ? "text" : "password"}
                        value={password.confirmNewPassword}
                        onChange={(e) => setPassword({ ...password, confirmNewPassword: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNew(!showConfirmNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showConfirmNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isChangingPassword} className="bg-emerald-600 hover:bg-emerald-700 w-full mt-2">
                    {isChangingPassword ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                    ) : (
                      <><Lock className="h-4 w-4 mr-2" /> Update Password</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
