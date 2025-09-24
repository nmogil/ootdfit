import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "../SignInForm";
import { Modal } from "./Modal";
import { useEffect } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Auto-close modal when user successfully authenticates
  useEffect(() => {
    if (loggedInUser && isOpen) {
      onClose();
    }
  }, [loggedInUser, isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to OOTD Collage">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Sign in to start creating beautiful fashion collages from your outfit photos
          </p>
        </div>
        <SignInForm />
      </div>
    </Modal>
  );
}