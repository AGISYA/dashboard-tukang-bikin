"use client";
import Topbar from "@/components/layout/Topbar";
import RoomTable from "@/components/table/RoomTable";
import { useRooms } from "@/hooks/useRooms";
import { useDeleteRoom } from "@/hooks/useDeleteRoom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function RoomsPage() {
  const { data, refetch } = useRooms();
  const del = useDeleteRoom();
  const router = useRouter();
  function onEdit(id: string) {
    router.push(`/rooms/${id}/edit`);
  }
  function onDelete(id: string) {
    if (confirm("Are you sure you want to delete this room?")) {
      del.mutate(id, {
        onSuccess: () => refetch(),
        onError: (err: any) => alert(err.message),
      });
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
          <p className="text-muted-foreground mt-1">Manage product rooms.</p>
        </div>
        <Link href="/rooms/new">
          <Button>+ New Room</Button>
        </Link>
      </div>
      <RoomTable
        items={(data ?? []).map((r) => ({ id: r.id, name: r.name, active: r.active }))}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
