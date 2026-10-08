import type { RouteRecordNormalized } from "vue-router";

export interface NavLink {
  title: string;
  path: string;
  description?: string;
  children?: NavLink[];
}

export interface BreadcrumbItem extends NavLink {
  isCurrent?: boolean;
}

interface NavigationItem extends NavLink {
  parent?: string;
  order: number;
}

function createNavigation(routes: RouteRecordNormalized[]): NavLink[] {
  const items = routes
    .flatMap((route): NavigationItem[] => {
      const { navigation, title, description } = route.meta;
      if (!navigation || !title) return [];

      return [
        {
          title,
          description,
          path: route.path,
          parent: navigation.parent,
          order: navigation.order,
        },
      ];
    })
    .sort((left, right) => left.order - right.order);

  const childrenOf = (parent?: string): NavLink[] =>
    items
      .filter((item) => item.parent === parent)
      .map(({ parent: _parent, order: _order, ...item }) => {
        const children = childrenOf(item.path);
        return children.length > 0 ? { ...item, children } : item;
      });

  return childrenOf();
}

function getPathToNode(pathname: string, items: NavLink[], path: NavLink[] = []): NavLink[] {
  for (const item of items) {
    const currentPath = [...path, item];
    if (item.path === pathname) return currentPath;
    if (item.children) {
      const found = getPathToNode(pathname, item.children, currentPath);
      if (found.length > 0) return found;
    }
  }
  return [];
}

export function useNavigation() {
  const router = useRouter();
  const navlinks = computed(() => createNavigation(router.getRoutes()));

  const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const path = getPathToNode(normalized, navlinks.value);
    return path.map((item, index) => ({
      ...item,
      isCurrent: index === path.length - 1,
    }));
  };

  return { navlinks, generateBreadcrumbs };
}
