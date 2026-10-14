import { X } from "lucide-react";
import { User } from "../../types";
import { formatDate, fullName, humanize } from "../../util/utils";

const yesNo = (value: boolean | null | undefined) => (value ? "Yes" : "No");
const orNA = (value: string | null | undefined) =>
  !value || value === "not_specified" || value === "Not Specified" ? "N/A" : value;

interface UserDetailProps {
  user: User;
  onClose: () => void;
}

const UserDetail = ({ user, onClose }: UserDetailProps) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Student Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close details">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div>
          <h4 className="text-lg font-semibold mb-3 text-liturgical-blue">Personal Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Student ID" value={user.studentid} />
            <DetailField label="Full Name" value={fullName(user)} />
            <DetailField label="Baptismal Name" value={orNA(user.baptismalname)} />
            <DetailField label="Gender" value={user.gender} />
            <DetailField label="Phone" value={user.phone} />
            <DetailField label="Email" value={orNA(user.useremail)} />
            <DetailField label="Telegram" value={orNA(user.telegram_username)} />
            <DetailField label="Birth Date" value={formatDate(user.birthdate)} />
            <DetailField label="Nationality" value={user.nationality} />
            <DetailField label="Region" value={humanize(user.region)} />
            <DetailField label="Zone" value={orNA(user.zonename)} />
            <DetailField label="Mother Tongue" value={humanize(user.mothertongue)} />
            <DetailField label="Physical Impairment" value={user.isphysicallydisabled} />
            <DetailField label="Clergy Status" value={user.clergicalstatus || "None"} />
          </div>
        </div>

        {user.universityusers && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-liturgical-blue">University Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Department" value={user.universityusers.departmentname} />
              <DetailField label="Batch" value={humanize(user.universityusers.batch)} />
              <DetailField label="Sponsorship" value={humanize(user.universityusers.sponsorshiptype)} />
              <DetailField label="Participation" value={humanize(user.universityusers.participation)} />
              <DetailField label="Role" value={humanize(user.universityusers.role)} />
              <DetailField label="Activity Level" value={humanize(user.universityusers.activitylevel)} />
              <DetailField label="Confession Father" value={orNA(user.universityusers.confessionfather)} />
              <DetailField label="Has Advisor" value={user.universityusers.advisors} />
              <DetailField label="Meal Card" value={orNA(user.universityusers.mealcard)} />
              <DetailField label="Cafeteria Access" value={yesNo(user.universityusers.cafeteriaaccess)} />
              <DetailField label="Cafeteria Name" value={orNA(user.universityusers.cafeterianame)} />
              <DetailField label="Holiday in Campus" value={yesNo(user.universityusers.holidayincampus)} />
              <DetailField label="Took Course" value={yesNo(user.universityusers.tookcourse)} />
              <DetailField label="Emergency Contact" value={orNA(user.universityusers.emergencyname)} />
              <DetailField label="Emergency Phone" value={orNA(user.universityusers.emergencyphone)} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
          Close
        </button>
      </div>
    </div>
  );
};

const DetailField = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-base text-gray-900 mt-1 break-words">{value || "N/A"}</p>
  </div>
);

export default UserDetail;
