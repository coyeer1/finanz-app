import { getOrganization, getOrganizationMembers } from "@/actions/organization";
import { OrganizationClient } from "./organization-client";

export const metadata = {
  title: "Organización",
};

export default async function OrganizationSettingsPage() {
  const [orgResult, membersResult] = await Promise.all([
    getOrganization(),
    getOrganizationMembers(),
  ]);

  const org = orgResult.success && orgResult.data ? orgResult.data : null;
  const members = membersResult.success ? (membersResult.data ?? []) : [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-in">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
          Organización
        </h1>
      </div>
      <OrganizationClient organization={org} members={members} />
    </div>
  );
}
