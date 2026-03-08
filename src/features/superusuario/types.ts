export type SuperusuarioModule =
  | "TECNICO"
  | "SECRETARIA"
  | "ACESSO"
  | "MONITORAMENTO";

export type MenuItemConfig = {
  module: SuperusuarioModule;
  label: string;
};

export const MENU_ITEMS: MenuItemConfig[] = [
  { module: "TECNICO", label: "Módulo Técnico" },
  { module: "SECRETARIA", label: "Módulo Secretaria" },
  { module: "ACESSO", label: "Controle de Acesso" },
  { module: "MONITORAMENTO", label: "Monitoramento" },
];
