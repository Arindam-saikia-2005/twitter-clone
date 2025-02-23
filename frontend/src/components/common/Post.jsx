import { FaRegComment, FaRegHeart, FaRegBookmark, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utlis/date/date.js";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");

  const { data: authUser, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
  });

  const queryClient = useQueryClient();

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/like/${post._id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: (updatedLikes) => {
      toast.success("Post liked successfully!");
      queryClient.setQueryData(["posts"], (oldData) =>
        oldData ? oldData.map((p) => (p._id === post._id ? { ...p, likes: updatedLikes } : p)) : []
      );
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async (newComment) => {
      const res = await fetch(`/api/posts/comment/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      toast.success("Commented successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  if (isAuthLoading) return <LoadingSpinner />;

  const isLiked = authUser ? post.likes.includes(authUser._id) : false;
  const isMyPost = authUser?._id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt);

  const handleLikePost = () => {
    if (!isLiking) likePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!isCommenting && comment.trim()) commentPost(comment);
  };

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <Link to={`/profile/${post.user.username}`} className="w-8 rounded-full overflow-hidden">
        <img src={post.user?.profilePic || "/avatar-placeholder.png"} />
      </Link>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${post.user.username}`} className="font-bold">
            {post.user.fullName}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${post.user.username}`}>@{post.user.username}</Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              <FaTrash className="cursor-pointer hover:text-red-500" onClick={() => deletePost()} />
              {isDeleting && <LoadingSpinner size="sm" />}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post.text}</span>
          {post.img && (
            <img src={post.img} className="h-80 object-contain rounded-lg border border-gray-700" alt="" />
          )}
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() => document.getElementById(`comments_modal${post._id}`).classList.add("modal-open")}
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">{post.comments.length}</span>
            </div>

            <div className="flex gap-1 items-center group cursor-pointer">
              <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
              <span className="text-sm text-slate-500 group-hover:text-green-500">0</span>
            </div>

            <div
              className={`flex gap-1 items-center group cursor-pointer ${
                isLiking ? "pointer-events-none opacity-50" : ""
              }`}
              onClick={handleLikePost}
            >
              {isLiked ? (
                <FaRegHeart className="w-4 h-4 text-pink-500" />
              ) : (
                <FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500" />
              )}
              <span className={`text-sm ${isLiked ? "text-pink-500" : "text-slate-500"} group-hover:text-pink-500`}>
                {post.likes.length}
              </span>
            </div>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Modal */}
      <dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
        <div className="modal-box rounded border border-gray-600">
          <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
          <div className="flex flex-col gap-3 max-h-60 overflow-auto">
            {post.comments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet 🤔 Be the first one 😉</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-2 items-start">
                  <img src={comment.user.profileImg || "/avatar-placeholder.png"} className="w-8 rounded-full" />
                  <div className="text-sm">{comment.text}</div>
                </div>
              ))
            )}
          </div>
          <button className="btn btn-sm btn-outline" onClick={() => document.getElementById(`comments_modal${post._id}`).classList.remove("modal-open")}>
            Close
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default Post;
