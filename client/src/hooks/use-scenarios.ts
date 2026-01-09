import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertScenario } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useScenarios() {
  return useQuery({
    queryKey: [api.scenarios.list.path],
    queryFn: async () => {
      const res = await fetch(api.scenarios.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scenarios");
      return api.scenarios.list.responses[200].parse(await res.json());
    },
  });
}

export function useScenario(id: number | null) {
  return useQuery({
    queryKey: [api.scenarios.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.scenarios.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch scenario");
      return api.scenarios.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertScenario) => {
      // Ensure backend validation passes - backend uses z.coerce where needed but let's be safe
      const res = await fetch(api.scenarios.create.path, {
        method: api.scenarios.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.scenarios.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save scenario");
      }
      return api.scenarios.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scenarios.list.path] });
      toast({
        title: "Success",
        description: "Scenario saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.scenarios.delete.path, { id });
      const res = await fetch(url, { method: api.scenarios.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete scenario");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scenarios.list.path] });
      toast({
        title: "Deleted",
        description: "Scenario removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
