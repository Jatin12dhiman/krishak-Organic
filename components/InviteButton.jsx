import { Share2 } from "lucide-react";
import { useState } from "react";

export default function InviteButton({ user }) {
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode;
  const referralLink = `${window.location.origin}/signup?referralCode=${referralCode}`;
  const message = `Hey! 👋 Join this awesome platform using my referral link and get rewards. Use my code: ${referralCode}\n\n${referralLink}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on this app 🚀",
          text: message,
          url: referralLink,
        });
      } catch (err) {
        console.error("Share cancelled", err);
      }
    } else {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user.isEmailVerified && (
        <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 border border-blue-300">
          Email Verified
        </span>
      )}

      <button
        onClick={handleShare}
        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
      >
        <Share2 size={16} />
        {copied ? "Copied!" : "Invite Friends"}
      </button>
    </div>
  );
}
