import { getAccounts, getTotalBalance } from "@/actions/accounts";
import { getOrgCurrency } from "@/actions/organization";
import { AccountsClient } from "./accounts-client";

export const metadata = {
  title: "Cuentas",
};

export default async function AccountsPage() {
  const [accountsResult, balanceResult, currency] = await Promise.all([
    getAccounts(),
    getTotalBalance(),
    getOrgCurrency(),
  ]);

  const accounts = accountsResult.success ? accountsResult.data ?? [] : [];
  const totalBalance = balanceResult.success ? balanceResult.data ?? 0 : 0;

  return (
    <div className="space-y-6">
      <div className="animate-in">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
          Cuentas
        </h1>
      </div>

      <AccountsClient
        initialAccounts={accounts}
        totalBalance={totalBalance}
        currency={currency}
      />
    </div>
  );
}
