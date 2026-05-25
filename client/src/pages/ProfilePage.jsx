import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import AuthContext from "../../context/AuthContext.js";

const ProfilePage = () => {
  const { authUser, updateProfile, logout } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
  const [isUpdating, setIsUpdating] = useState(false);

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
      await updateProfile({ profilePic: profilePic, fullName: name, bio });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center relative p-4">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
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
          <h3 className="text-lg">Profile Details</h3>
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
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write Profile bio"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}></textarea>
          <button
            type="submit"
            className="bg-linear-to-r from-purple-400 to-violet-600 text-white p-2 text-lg rounded-full cursor-pointer">
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={logout}
            className=" bg-white/10 text-white border border-gray-600 p-2 text-lg rounded-full cursor-pointer hover:bg-white/20 transition">
            Logout
          </button>
        </form>
        <img
          className={`max-w-54 aspect-square rounded-full mx-10 max-sm:mt-10 `}
          src={assets.logo_icon}
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfilePage;
