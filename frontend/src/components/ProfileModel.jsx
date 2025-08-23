import React, { useState } from "react";
import { dummyUserData } from "../assets/assets";
import { Pencil, User } from "lucide-react";

const ProfileModel = ({setShowEdit}) => {
  const user = dummyUserData;
  const [editFrom, setEditFrom] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
    full_name: user.full_name,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
  };

  return (
    <div className=" fixed top-0 left-0 bottom-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50">
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className=" text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>
          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div className="flex flex-col items-start gap-3">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="profile_picture"
              >
                Profile Picture
                <input
                  hidden
                  onChange={(e) =>
                    setEditFrom({
                      ...editFrom,
                      profile_picture: e.target.files[0],
                    })
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  type="file"
                  accept="image/*"
                  id="profile_picture"
                />
                <div className="relative group mt-2">
                  <img
                    className="w-24 h-24 rounded-full object-cover"
                    src={
                      editFrom.profile_picture
                        ? URL.createObjectURL(editFrom.profile_picture)
                        : user.profile_picture
                    }
                    alt=""
                  />
                  <div className="absolute inset-0 hidden group-hover:flex bg-black/20 rounded-full items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>

            {/* cover Photo  */}
            <div className="flex flex-col items-start gap-3">
              <label
              className="block text-sm font-medium text-gray-700 mb-1" 
              htmlFor="cover_photo"
              >
                Cover Photo
                <input hidden type="file" accept="image/*" id="cover_photo"
                className="w-full p-3 border border-gray-200 rounded-lg"
                onChange={(e)=>setEditFrom({...editFrom, cover_photo:e.target.files[0]})}
                />
                <div className=" group/cover relative">
                  <img 
                  className="w-80 h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 object-cover mt-2"
                  src={editFrom.cover_photo ? URL.createObjectURL(editFrom.cover_photo) : user.cover_photo} alt="" 
                  />
                  <div className=" absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input type="text" 
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="Please Enter your full name"
              onChange={(e)=>setEditFrom({...editFrom,full_name:e.target.value})}
              value={editFrom.full_name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input type="text" 
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="Please Enter a username"
              onChange={(e)=>setEditFrom({...editFrom,username:e.target.value})}
              value={editFrom.username}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea type="text" 
              rows={3}
              className="w-full resize-none p-3 border border-gray-200 rounded-lg"
              placeholder="Please Enter a short Bio"
              onChange={(e)=>setEditFrom({...editFrom,bio:e.target.value})}
              value={editFrom.bio}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input type="text" 
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="Please Enter your location"
              onChange={(e)=>setEditFrom({...editFrom,location:e.target.value})}
              value={editFrom.location}
              />
            </div>

            <div className=" flex justify-end space-x-3 pt-6">
                <button
                onClick={()=>setShowEdit(false)}
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Cancle
                </button>

                <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-colors"
                >
                  Save Changes
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModel;
