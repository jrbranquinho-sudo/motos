import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Fetch all users from the database for cross-device authentication and sync
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier");

    if (identifier) {
      const clean = identifier.trim().toLowerCase();
      const cleanPrefix = clean.includes("@") ? clean.split("@")[0].trim() : clean;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: clean },
            { email: clean },
            { username: cleanPrefix },
          ],
        },
      });

      return NextResponse.json({ success: true, user });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao carregar usuários";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH: Update user password and settings directly in the database
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, username, email, password, mustChangePassword, twoFactorEnabled, name, phone, role } = body;

    if (!id && !username && !email) {
      return NextResponse.json(
        { success: false, error: "ID, usuário ou e-mail é obrigatório para atualização." },
        { status: 400 }
      );
    }

    // Find the user to update
    const user = await prisma.user.findFirst({
      where: id
        ? { id }
        : {
            OR: [
              ...(username ? [{ username }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado no banco de dados." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (password !== undefined) updateData.password = password;
    if (mustChangePassword !== undefined) updateData.mustChangePassword = mustChangePassword;
    if (twoFactorEnabled !== undefined) updateData.twoFactorEnabled = twoFactorEnabled;
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso no banco de dados.",
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar usuário no banco de dados";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Register or upsert a new user in the database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      email,
      username,
      password = "mot-os123",
      phone,
      avatar,
      role = "MECHANIC",
      mustChangePassword = false,
      twoFactorEnabled = false,
      tenantId,
    } = body;

    if (!email || !name || !tenantId) {
      return NextResponse.json(
        { success: false, error: "Nome, e-mail e tenantId são obrigatórios." },
        { status: 400 }
      );
    }

    const createdUser = await prisma.user.upsert({
      where: id ? { id } : { email_tenantId: { email, tenantId } },
      update: {
        name,
        username,
        password,
        phone,
        avatar,
        role,
        mustChangePassword,
        twoFactorEnabled,
      },
      create: {
        id: id || `user-${Date.now()}`,
        name,
        email,
        username: username || email.split("@")[0],
        password,
        phone,
        avatar,
        role,
        mustChangePassword,
        twoFactorEnabled,
        tenantId,
      },
    });

    return NextResponse.json({ success: true, user: createdUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao cadastrar usuário";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
