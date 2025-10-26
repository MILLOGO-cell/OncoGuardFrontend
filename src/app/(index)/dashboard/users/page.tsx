"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Edit, Trash2, Mail, CheckCircle, XCircle } from "lucide-react";
import Table, { TableAction, TableColumn } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useUsers } from "@/hooks/useUsers";
import { useUserAdminStore } from "@/store/userAdminStore";
import type { UserOut } from "@/types/auth";
import type { UserUpdate, UserCreate } from "@/types/auth";

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOut | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserOut | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Utiliser createUser au lieu de register
  const { fetchUsers, createUser, saveUser, removeUser } = useUsers();
  const { items: users, loading } = useUserAdminStore();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: TableColumn<UserOut>[] = [
    {
      key: "full_name",
      label: "Nom complet",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {(user.full_name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{user.full_name || user.email}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-4 w-4" />
          {user.email}
        </div>
      ),
    },
    {
      key: "is_verified",
      label: "Vérifié",
      render: (user) =>
        user.is_verified ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-gray-400" />
        ),
    },
    {
      key: "is_active",
      label: "Statut",
      sortable: true,
      render: (user) => (
        <Badge tone={user.is_active ? "green" : "red"}>{user.is_active ? "Actif" : "Inactif"}</Badge>
      ),
    },
    {
      key: "created_at",
      label: "Date de création",
      sortable: true,
      render: (user) =>
        user.created_at
          ? new Date(user.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
  ];

  const actions: TableAction<UserOut>[] = [
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      variant: "outline",
      onClick: (user) => {
        setSelectedUser(user);
        setFormData({
          full_name: user.full_name || "",
          email: user.email,
        });
        setIsEditMode(true);
        setIsModalOpen(true);
      },
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "danger",
      onClick: (user) => {
        setUserToDelete(user);
        setIsDeleteOpen(true);
      },
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && selectedUser) {
        // ✅ Modifier un utilisateur existant
        const payload: UserUpdate = {
          full_name: formData.full_name,
          email: formData.email,
        };
        await saveUser(selectedUser.id, payload);
      } else {
        // ✅ Créer un nouveau utilisateur (sans affecter le user connecté)
        const payload: UserCreate = {
          full_name: formData.full_name,
          email: formData.email,
          password: "", // Le backend génère automatiquement
        };
        await createUser(payload);
      }
      
      // Rafraîchir la liste
      await fetchUsers();
      
      // Fermer le modal
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedUser(null);
      setFormData({ full_name: "", email: "" });
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({ full_name: "", email: "" });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await removeUser(userToDelete.id);
      await fetchUsers();
      setIsDeleteOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: users.length,
    actifs: users.filter((u) => u.is_active).length,
    verifies: users.filter((u) => u.is_verified).length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
            <p className="text-sm text-gray-500">Gérez les utilisateurs de la plateforme</p>
          </div>
        </div>
        <Button variant="primary" iconLeft={<UserPlus className="h-4 w-4" />} onClick={handleOpenModal} disabled={loading}>
          Ajouter un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Actifs</div>
          <div className="text-2xl font-bold text-green-600">{stats.actifs}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Vérifiés</div>
          <div className="text-2xl font-bold text-blue-600">{stats.verifies}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        {loading && users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chargement des utilisateurs...</div>
        ) : (
          <Table
            columns={columns}
            data={users}
            actions={actions}
            searchPlaceholder="Rechercher par nom ou email..."
            searchBy={["full_name", "email"]}
            pageSize={10}
          />
        )}
      </div>

      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={isEditMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
        description={isEditMode ? "Modifiez les informations de l'utilisateur" : "Créez un nouveau compte utilisateur. Un mot de passe sera généré automatiquement et envoyé par email."}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            placeholder="Ex: Dr. Agnes Sanou"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            placeholder="exemple@oncoguard.fr"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />

          {!isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
              ℹ️ Un mot de passe sera généré automatiquement et envoyé à l'utilisateur par email.
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              {isEditMode ? "Mettre à jour" : "Créer l'utilisateur"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Confirmer la suppression"
        description={
          userToDelete
            ? `Voulez-vous vraiment supprimer ${userToDelete.full_name || userToDelete.email} ? Cette action est irréversible.`
            : ""
        }
        size="sm"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleting}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDelete} isLoading={deleting}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}