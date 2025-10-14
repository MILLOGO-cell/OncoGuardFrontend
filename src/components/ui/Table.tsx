"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Pagination from "./Pagination";
import Filter from "./Filter";
import Checkbox from "./Checkbox";
import Input from "./Input";
import Button from "./Button";
import { ArrowUpDown } from "lucide-react";

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "default"
  | "link"
  | "outline";

export interface TableAction<T = Record<string, unknown>> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
  variant?: ButtonVariant;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data?: T[];
  actions?: TableAction<T>[];
  pageSize?: number;
  filterOptions?: { label: string; value: string }[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
  enableSelect?: boolean;
  onSelectChange?: (selected: T[]) => void;
  filterKey?: keyof T | string;
  filterExact?: boolean;
  filterLabel?: string;
  searchBy?: (keyof T | string)[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  disableClientFiltering?: boolean;
  selectedRows?: T[]; // Support pour sélection externe
}

export function Table<T = Record<string, unknown>>({
  columns,
  data = [],
  actions = [],
  pageSize = 10,
  filterOptions,
  filterValue = "",
  onFilterChange,
  searchPlaceholder = "Rechercher...",
  className,
  enableSelect = false,
  onSelectChange,
  filterKey,
  filterExact = true,
  filterLabel,
  searchBy,
  searchValue,
  onSearchChange,
  disableClientFiltering = false,
  selectedRows: externalSelectedRows,
}: TableProps<T>) {
  const ALL = "__all__";
  const safeData = React.useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [uncontrolledSearch, setUncontrolledSearch] = React.useState("");
  const isControlled = typeof searchValue === "string";
  const currentSearch = isControlled ? (searchValue as string) : uncontrolledSearch;

  const [page, setPage] = React.useState(1);
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Gestion de la sélection (externe ou interne)
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<Set<T>>(new Set());
  const selectedRowsSet = React.useMemo(() => {
    if (externalSelectedRows) {
      return new Set(externalSelectedRows);
    }
    return internalSelectedRows;
  }, [externalSelectedRows, internalSelectedRows]);

  const allColumnKeys = React.useMemo(() => columns.map((c) => String(c.key)), [columns]);
  const effectiveSearchBy = React.useMemo(
    () => (searchBy && searchBy.length ? searchBy.map(String) : allColumnKeys),
    [searchBy, allColumnKeys]
  );

  const hasAllProvided = React.useMemo(
    () => (filterOptions?.some((o) => o.value === "") ?? false),
    [filterOptions]
  );

  const normalizedFilterOptions = React.useMemo(
    () => filterOptions?.map((o) => (o.value === "" ? { ...o, value: ALL } : o)) ?? [],
    [filterOptions]
  );
  const filterValueForControl = filterValue === "" ? ALL : filterValue;

  const filteredData = React.useMemo(() => {
    if (disableClientFiltering) return safeData;
    let rows = safeData.slice();

    // Filtrage
    if (filterValue) {
      if (filterKey) {
        rows = rows.filter((row) => {
          const v = String((row as Record<string, unknown>)[filterKey as string] ?? "").toLowerCase();
          const q = filterValue.toLowerCase();
          return filterExact ? v === q : v.includes(q);
        });
      } else {
        rows = rows.filter((row) =>
          Object.values(row as Record<string, unknown>).some((value) =>
            String(value).toLowerCase().includes(filterValue.toLowerCase())
          )
        );
      }
    }

    // Recherche
    if (currentSearch.trim()) {
      const keys = new Set(effectiveSearchBy);
      const q = currentSearch.toLowerCase();
      rows = rows.filter((row) =>
        Object.entries(row as Record<string, unknown>).some(
          ([k, v]) => keys.has(k) && String(v ?? "").toLowerCase().includes(q)
        )
      );
    }

    // Tri
    if (sortConfig) {
      rows.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortConfig.key];
        const bVal = (b as Record<string, unknown>)[sortConfig.key];
        
        // Conversion en string pour comparaison sécurisée
        const aStr = String(aVal ?? '').toLowerCase();
        const bStr = String(bVal ?? '').toLowerCase();
        
        // Tentative de conversion en nombre si possible
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        const isNumeric = !isNaN(aNum) && !isNaN(bNum) && aVal !== '' && bVal !== '';
        
        if (isNumeric) {
          // Comparaison numérique
          if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else {
          // Comparaison alphabétique
          if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    return rows;
  }, [
    safeData,
    currentSearch,
    filterValue,
    filterKey,
    filterExact,
    effectiveSearchBy,
    disableClientFiltering,
    sortConfig,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  React.useEffect(() => {
    setPage(1);
  }, [currentSearch, filterValue, filterKey, filterExact, pageSize, disableClientFiltering, data]);

  React.useEffect(() => {
    if (onSelectChange && !externalSelectedRows) {
      onSelectChange(Array.from(internalSelectedRows));
    }
  }, [internalSelectedRows, onSelectChange, externalSelectedRows]);

  const toggleRow = (row: T) => {
    if (externalSelectedRows) {
      // Si contrôlé de l'extérieur, on laisse le parent gérer
      const currentSelected = new Set(externalSelectedRows);
      const newSelected = currentSelected.has(row) 
        ? externalSelectedRows.filter(r => r !== row)
        : [...externalSelectedRows, row];
      onSelectChange?.(newSelected);
    } else {
      // Gestion interne
      setInternalSelectedRows((prev) => {
        const s = new Set(prev);
        s.has(row) ? s.delete(row) : s.add(row);
        return s;
      });
    }
  };

  const toggleSelectAll = () => {
    const currentPageSet = new Set(paginatedData);
    const allCurrentSelected = paginatedData.every(row => selectedRowsSet.has(row));
    
    if (externalSelectedRows) {
      let newSelected;
      if (allCurrentSelected) {
        // Désélectionner tous les éléments de la page courante
        newSelected = externalSelectedRows.filter(row => !currentPageSet.has(row));
      } else {
        // Sélectionner tous les éléments de la page courante
        const toAdd = paginatedData.filter(row => !selectedRowsSet.has(row));
        newSelected = [...externalSelectedRows, ...toAdd];
      }
      onSelectChange?.(newSelected);
    } else {
      setInternalSelectedRows(prev => {
        const newSet = new Set(prev);
        if (allCurrentSelected) {
          paginatedData.forEach(row => newSet.delete(row));
        } else {
          paginatedData.forEach(row => newSet.add(row));
        }
        return newSet;
      });
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // Remove sort
    });
  };

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(false);

  const updateScrollShadows = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    updateScrollShadows();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollShadows();
    const ro = new ResizeObserver(() => updateScrollShadows());
    el.addEventListener("scroll", onScroll, { passive: true });
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [updateScrollShadows]);

  // Calcul des stats de sélection pour la page courante
  const selectedOnPage = paginatedData.filter(row => selectedRowsSet.has(row)).length;
  const allSelected = selectedOnPage === paginatedData.length && paginatedData.length > 0;
  const someSelected = selectedOnPage > 0 && selectedOnPage < paginatedData.length;

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      {/* Barre de contrôles - Design original */}
      <div className="flex flex-wrap gap-2 items-end">
        {filterOptions && onFilterChange && (
          <Filter
            options={normalizedFilterOptions}
            value={filterValueForControl}
            onChange={(v) => onFilterChange(v === ALL ? "" : v)}
            className="w-40"
            label={filterLabel}
            withAllOption={!hasAllProvided}
          />
        )}
        <Input
          placeholder={searchPlaceholder}
          value={currentSearch}
          onChange={(e) => (isControlled ? onSearchChange?.(e.target.value) : setUncontrolledSearch(e.target.value))}
          className="flex-1"
          clearable
        />
      </div>

      {/* Table - Design original avec nouvelles fonctionnalités */}
      <div className="relative">
        {showLeft && <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-background to-transparent" />}
        {showRight && <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-background to-transparent" />}

        <div
          ref={scrollRef}
          className={clsx(
            "overflow-x-auto overflow-y-hidden rounded-lg border",
            "scroll-smooth",
            "scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent"
          )}
        >
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr>
                {enableSelect && (
                  <th className="sticky top-0 z-10 border-b bg-muted px-4 py-2 text-left font-medium">
                    <Checkbox 
                      checked={allSelected}
                      indeterminate={someSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={clsx(
                      "sticky top-0 z-10 border-b bg-muted px-4 py-2 text-left font-medium",
                      col.sortable && "cursor-pointer hover:bg-muted/80 transition-colors"
                    )}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown className={clsx(
                          "h-4 w-4 transition-colors",
                          sortConfig?.key === col.key 
                            ? "text-primary" 
                            : "text-muted-foreground"
                        )} />
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="sticky top-0 z-10 border-b bg-muted px-4 py-2 text-left font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rowIndex) => {
                    const isSelected = selectedRowsSet.has(row);
                    return (
                      <motion.tr
                        key={rowIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={clsx(
                          "border-b hover:bg-muted/50 transition-colors",
                          isSelected && "bg-muted/30"
                        )}
                      >
                        {enableSelect && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <Checkbox 
                              checked={isSelected} 
                              onCheckedChange={() => toggleRow(row)}
                            />
                          </td>
                        )}
                        {columns.map((col) => (
                          <td key={String(col.key)} className="px-4 py-2 whitespace-nowrap">
                            {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                          </td>
                        ))}
                        {actions.length > 0 && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {actions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant={action.variant ?? "outline"}
                                  className={action.className}
                                  onClick={() => action.onClick(row)}
                                  iconLeft={action.icon}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (actions.length ? 1 : 0) + (enableSelect ? 1 : 0)}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Design original */}
      {totalPages > 1 && (
        <Pagination
          onPrevPage={page > 1 ? () => setPage(page - 1) : undefined}
          onNextPage={page < totalPages ? () => setPage(page + 1) : undefined}
        />
      )}
    </div>
  );
}

export default Table;