import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EXPENSE_CATEGORIES = [
  { name: "Alimentación", icon: "utensils", color: "#f97316" },
  { name: "Transporte", icon: "car", color: "#3b82f6" },
  { name: "Vivienda", icon: "home", color: "#8b5cf6" },
  { name: "Salud", icon: "heart-pulse", color: "#ef4444" },
  { name: "Entretenimiento", icon: "gamepad-2", color: "#ec4899" },
  { name: "Educación", icon: "graduation-cap", color: "#06b6d4" },
  { name: "Servicios", icon: "zap", color: "#f59e0b" },
  { name: "Otros gastos", icon: "more-horizontal", color: "#6b7280" },
];

const INCOME_CATEGORIES = [
  { name: "Salarios", icon: "banknote", color: "#22c55e" },
  { name: "Ventas", icon: "shopping-bag", color: "#10b981" },
  { name: "Inversiones", icon: "trending-up", color: "#14b8a6" },
  { name: "Freelance", icon: "laptop", color: "#6366f1" },
  { name: "Otros ingresos", icon: "plus-circle", color: "#84cc16" },
];

async function main() {
  console.log("Seeding database...");

  const org = await prisma.organization.create({
    data: {
      name: "Demo Company",
      slug: "demo-company",
      currency: "COP",
    },
  });

  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Admin Demo",
      email: "demo@finanzapp.com",
      hashedPassword,
      role: "OWNER",
      organizationId: org.id,
    },
  });

  const expenseCategories = await Promise.all(
    EXPENSE_CATEGORIES.map((cat) =>
      prisma.category.create({
        data: {
          ...cat,
          type: "EXPENSE",
          isDefault: true,
          organizationId: org.id,
        },
      })
    )
  );

  const incomeCategories = await Promise.all(
    INCOME_CATEGORIES.map((cat) =>
      prisma.category.create({
        data: {
          ...cat,
          type: "INCOME",
          isDefault: true,
          organizationId: org.id,
        },
      })
    )
  );

  const bankAccount = await prisma.account.create({
    data: {
      name: "Banco Principal",
      type: "BANK",
      currency: "COP",
      initialBalance: 5000000,
      currentBalance: 5000000,
      color: "#3b82f6",
      icon: "landmark",
      organizationId: org.id,
    },
  });

  const cashAccount = await prisma.account.create({
    data: {
      name: "Efectivo",
      type: "CASH",
      currency: "COP",
      initialBalance: 500000,
      currentBalance: 500000,
      color: "#22c55e",
      icon: "banknote",
      organizationId: org.id,
    },
  });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const transactions: Array<{
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    date: Date;
    isPersonal: boolean;
    categoryId: string;
    accountId: string;
  }> = [];

  const salaryCategory = incomeCategories.find((c) => c.name === "Salarios")!;
  const salesCategory = incomeCategories.find((c) => c.name === "Ventas")!;
  const freelanceCategory = incomeCategories.find((c) => c.name === "Freelance")!;

  transactions.push(
    {
      type: "INCOME",
      amount: 4500000,
      description: "Salario mensual",
      date: new Date(currentYear, currentMonth, 1),
      isPersonal: false,
      categoryId: salaryCategory.id,
      accountId: bankAccount.id,
    },
    {
      type: "INCOME",
      amount: 1200000,
      description: "Venta de servicios web",
      date: new Date(currentYear, currentMonth, 5),
      isPersonal: false,
      categoryId: salesCategory.id,
      accountId: bankAccount.id,
    },
    {
      type: "INCOME",
      amount: 800000,
      description: "Proyecto freelance diseño UI",
      date: new Date(currentYear, currentMonth, 12),
      isPersonal: true,
      categoryId: freelanceCategory.id,
      accountId: bankAccount.id,
    }
  );

  const foodCategory = expenseCategories.find((c) => c.name === "Alimentación")!;
  const transportCategory = expenseCategories.find((c) => c.name === "Transporte")!;
  const housingCategory = expenseCategories.find((c) => c.name === "Vivienda")!;
  const healthCategory = expenseCategories.find((c) => c.name === "Salud")!;
  const entertainmentCategory = expenseCategories.find((c) => c.name === "Entretenimiento")!;
  const educationCategory = expenseCategories.find((c) => c.name === "Educación")!;
  const servicesCategory = expenseCategories.find((c) => c.name === "Servicios")!;

  const expenseItems = [
    { desc: "Mercado semanal", amount: 320000, cat: foodCategory, personal: true, day: 2 },
    { desc: "Almuerzo equipo", amount: 85000, cat: foodCategory, personal: false, day: 4 },
    { desc: "Restaurante fin de semana", amount: 120000, cat: foodCategory, personal: true, day: 8 },
    { desc: "Mercado semanal", amount: 290000, cat: foodCategory, personal: true, day: 9 },
    { desc: "Gasolina", amount: 180000, cat: transportCategory, personal: true, day: 3 },
    { desc: "Uber oficina", amount: 45000, cat: transportCategory, personal: false, day: 6 },
    { desc: "Peaje autopista", amount: 32000, cat: transportCategory, personal: true, day: 14 },
    { desc: "Arriendo apartamento", amount: 1800000, cat: housingCategory, personal: true, day: 1 },
    { desc: "Servicios públicos", amount: 250000, cat: servicesCategory, personal: true, day: 5 },
    { desc: "Internet fibra óptica", amount: 89000, cat: servicesCategory, personal: true, day: 5 },
    { desc: "Consulta médica", amount: 150000, cat: healthCategory, personal: true, day: 7 },
    { desc: "Medicamentos", amount: 65000, cat: healthCategory, personal: true, day: 7 },
    { desc: "Netflix + Spotify", amount: 52000, cat: entertainmentCategory, personal: true, day: 1 },
    { desc: "Cine y palomitas", amount: 48000, cat: entertainmentCategory, personal: true, day: 11 },
    { desc: "Curso online Python", amount: 180000, cat: educationCategory, personal: true, day: 10 },
    { desc: "Libro diseño UX", amount: 75000, cat: educationCategory, personal: false, day: 13 },
    { desc: "Dominio web empresa", amount: 45000, cat: servicesCategory, personal: false, day: 2 },
    { desc: "Hosting servidor", amount: 120000, cat: servicesCategory, personal: false, day: 2 },
    { desc: "Almuerzo rappi", amount: 35000, cat: foodCategory, personal: true, day: 15 },
    { desc: "Taxi aeropuerto", amount: 55000, cat: transportCategory, personal: false, day: 16 },
    { desc: "Gimnasio mensual", amount: 95000, cat: healthCategory, personal: true, day: 1 },
    { desc: "Café oficina", amount: 28000, cat: foodCategory, personal: false, day: 17 },
    { desc: "Ropa deportiva", amount: 185000, cat: entertainmentCategory, personal: true, day: 18 },
    { desc: "Regalo cumpleaños", amount: 120000, cat: entertainmentCategory, personal: true, day: 19 },
    { desc: "Parqueadero mensual", amount: 200000, cat: transportCategory, personal: true, day: 1 },
    { desc: "Seguro vehículo", amount: 280000, cat: transportCategory, personal: true, day: 10 },
    { desc: "Mantenimiento carro", amount: 350000, cat: transportCategory, personal: true, day: 20 },
  ];

  for (const item of expenseItems) {
    const day = Math.min(item.day, 28);
    transactions.push({
      type: "EXPENSE",
      amount: item.amount,
      description: item.desc,
      date: new Date(currentYear, currentMonth, day),
      isPersonal: item.personal,
      categoryId: item.cat.id,
      accountId: item.personal ? cashAccount.id : bankAccount.id,
    });
  }

  let bankBalance = 5000000;
  let cashBalance = 500000;

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        ...tx,
        userId: user.id,
        organizationId: org.id,
      },
    });

    if (tx.accountId === bankAccount.id) {
      bankBalance += tx.type === "INCOME" ? tx.amount : -tx.amount;
    } else {
      cashBalance += tx.type === "INCOME" ? tx.amount : -tx.amount;
    }
  }

  await prisma.account.update({
    where: { id: bankAccount.id },
    data: { currentBalance: bankBalance },
  });

  await prisma.account.update({
    where: { id: cashAccount.id },
    data: { currentBalance: cashBalance },
  });

  const budgets = [
    { categoryId: foodCategory.id, amount: 1200000 },
    { categoryId: transportCategory.id, amount: 800000 },
    { categoryId: housingCategory.id, amount: 2000000 },
    { categoryId: entertainmentCategory.id, amount: 400000 },
    { categoryId: healthCategory.id, amount: 400000 },
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: {
        ...budget,
        month: currentMonth + 1,
        year: currentYear,
        organizationId: org.id,
      },
    });
  }

  console.log("Seed completed!");
  console.log(`  Organization: ${org.name} (${org.slug})`);
  console.log(`  User: ${user.email} / password123`);
  console.log(`  Categories: ${expenseCategories.length + incomeCategories.length}`);
  console.log(`  Accounts: 2`);
  console.log(`  Transactions: ${transactions.length}`);
  console.log(`  Budgets: ${budgets.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
