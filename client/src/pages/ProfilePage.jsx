import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import AuthContext from "../../context/AuthContext.js";
import toast from "react-hot-toast";
import { Eye, EyeClosed } from "lucide-react";

const ProfilePage = () => {
  const { authUser, updateProfile, logout, axios } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    if (selectedImg) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateProfile({ profilePic: base64Image, fullName: name, bio });
        setIsUpdating(false);
        navigate("/");
      };
    } else {
      await updateProfile({
        profilePic: authUser?.profilePic || "",
        fullName: name,
        bio,
      });
      setIsUpdating(false);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center relative p-4 ">
      <div className="w-[50%] max-w-xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-5 p-10 flex-1 min-h-[520px]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex left-4 top-4 w-25 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-md border border-gray-600 hover:bg-white/20 transition"
            aria-label="Go back home"
            title="Back to home">
            <img src={assets.arrow_icon} alt="" className="w-4" />
            <span className="text-sm">Back</span>
          </button>
          <h3 className="text-3xl font-medium text-center">Profile Details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer">
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              className={`max-w-20 aspect-square rounded-full mx-2 max-sm:mt-5 ${selectedImg && "rounded-full"}`}
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt=""
            />
            <span>Upload Profile Picture</span>
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex flex-col gap-3">
            <label className="text-sm">Change Password</label>
            {!isVerified && (
              <div className="flex items-center gap-2">
                <input
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  value={currentPassword}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  className="p-2 flex-1 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  type="button">
                  {showPassword ? (
                    <EyeClosed className="w-5 h-5 cursor-pointer" />
                  ) : (
                    <Eye className="w-5 h-5 cursor-pointer" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsVerifying(true);
                    try {
                      const { data } = await axios.post(
                        "/api/auth/check-password",
                        { password: currentPassword },
                      );
                      if (data.success) {
                        setIsVerified(true);
                        toast.success(
                          "Password verified. You can set a new password now.",
                        );
                      } else {
                        toast.error(data.message || "Incorrect password");
                      }
                    } catch (err) {
                      toast.error(err.response?.data?.message || err.message);
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                  className="px-3 py-2 bg-green-500 rounded-2xl text-white cursor-pointer hover:bg-green-600 transition">
                  {isVerifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            )}

            {isVerified && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    className="p-2 flex-1 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    type="button">
                    {showPassword ? (
                      <EyeClosed className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!newPassword || newPassword.length < 6) {
                        return toast.error(
                          "New password must be at least 6 characters",
                        );
                      }
                      if (newPassword !== confirmPassword) {
                        return toast.error("Passwords do not match");
                      }
                      setIsChangingPassword(true);
                      try {
                        const { data } = await axios.put(
                          "/api/auth/change-password",
                          { currentPassword, newPassword },
                        );
                        if (data.success) {
                          toast.success("Password updated successfully");
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setIsVerified(false);
                        } else {
                          toast.error(
                            data.message || "Could not update password",
                          );
                        }
                      } catch (err) {
                        toast.error(err.response?.data?.message || err.message);
                      } finally {
                        setIsChangingPassword(false);
                      }
                    }}
                    className="px-4 py-2 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded">
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerified(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write Profile bio"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}></textarea>
          <button
            type="submit"
            className="bg-linear-to-r from-purple-400 to-violet-600 text-white p-2 text-lg rounded-full  cursor-pointer">
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={logout}
            className=" bg-white/10 text-white border border-gray-600 p-2 text-lg rounded-full cursor-pointer hover:bg-white/20 transition">
            Logout
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
