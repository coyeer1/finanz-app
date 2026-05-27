import type {
  Organization,
  User,
  Category,
  AccountType,
  TransactionType,
  Role,
  Plan,
} from "@prisma/client";

export type {
  Organization,
  User,
  Category,
  AccountType,
  TransactionType,
  Role,
  Plan,
};

export type SerializedAccount = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  icon: string;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AccountWithBalance = SerializedAccount & {
  _count: { transactions: number };
};

export type TransactionWithRelations = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  notes: string | null;
  date: Date;
  isPersonal: boolean;
  receiptUrl: string | null;
  categoryId: string;
  accountId: string;
  userId: string;
  organizationId: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
  account: SerializedAccount;
  user: Pick<User, "id" | "name" | "email">;
};

export type BudgetWithCategory = {
  id: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
  categoryId: string;
  organizationId: string;
  createdAt: Date;
  category: Category;
};

export type DashboardStats = {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  netSavings: number;
  incomeChange: number;
  expenseChange: number;
};

export type CategoryBreakdown = {
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
};

export type MonthlyTrend = {
  month: string;
  income: number;
  expense: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
};

export type CategoryWithCount = Category & {
  _count: { transactions: number };
};

export type TransactionFilters = {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  isPersonal?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};
