/**
 * registry.ts — motor de módulos por data-attribute
 *
 * La idea: cada comportamiento del sitio se declara en el HTML con un
 * atributo (data-reveal, data-parallax, data-marquee…) y se implementa en
 * un fichero de scripts/modules/. El registro es el único que sabe qué
 * módulos existen; en cada navegación con View Transitions, lifecycle.ts
 * llama a destroyAll() antes de salir y a mountAll() al entrar. Así:
 *
 *   · no hay scripts sueltos por sección: si el atributo no está en la
 *     página, el módulo no cuesta nada;
 *   · cada instancia devuelve su cleanup → cero listeners huérfanos;
 *   · un módulo que falla no tumba a los demás (cada init va en try/catch).
 *
 * Contrato de un módulo (ver defineModule):
 *
 *   export default defineModule({
 *     selector: '[data-marquee]',
 *     init(el, ctx) {
 *       el.addEventListener('mouseenter', pause, { signal: ctx.signal });
 *       const tween = gsap.to(...);
 *       return () => tween.kill();
 *     },
 *   });
 *
 * Y en lifecycle.ts: register('marquee', marquee).
 */

/** Función de limpieza que devuelve cada instancia montada. */
export type Cleanup = () => void;

/**
 * Contexto que recibe cada init. Se construye una vez por ciclo de montaje
 * (una vez por navegación), no por elemento.
 */
export interface ModuleContext {
  /**
   * prefers-reduced-motion: reduce. El módulo debe montar su estado final
   * sin animar (o no montar nada si su única función es animar).
   */
  readonly reducedMotion: boolean;

  /**
   * Se aborta en destroyAll(). Pásalo a addEventListener({ signal }) y
   * los listeners se quitan solos al navegar: es la forma preferida de
   * no dejar nada huérfano. Sigue haciendo falta devolver cleanup para
   * lo que no sea un listener (tweens, ScrollTriggers, observers).
   */
  readonly signal: AbortSignal;

  /**
   * Se resuelve cuando la "cortina" ha terminado de descubrir la página:
   * el preloader en la primera visita, la transición de página en las
   * navegaciones internas, o inmediatamente si no hay ninguna de las dos.
   * Es lo que espera data-reveal-first y la entrada del hero.
   */
  readonly ready: Promise<void>;

  /** Viewport por debajo de --bp-mobile (991px), evaluado una vez por montaje. */
  readonly isMobile: boolean;
}

export type ModuleInit = (el: HTMLElement, ctx: ModuleContext) => Cleanup | void;

export interface Module {
  /** Selector CSS del atributo que activa el módulo. */
  readonly selector: string;
  readonly init: ModuleInit;
  /**
   * Orden de montaje (menor primero, por defecto 0). Casi nunca hace falta;
   * sirve para que, p. ej., themeSwitch cree sus ScrollTriggers antes que
   * los reveals y el orden de disparo sea estable.
   */
  readonly order?: number;
}

/** Identidad tipada: existe solo para que los módulos se escriban con autocompletado. */
export const defineModule = (mod: Module): Module => mod;

/* -------------------------------------------------------------------------- */
/* Estado interno                                                             */
/* -------------------------------------------------------------------------- */

interface Instance {
  readonly name: string;
  readonly el: HTMLElement;
  readonly cleanup: Cleanup | undefined;
}

const modules = new Map<string, Module>();
let instances: Instance[] = [];

/** Qué módulos hay montados sobre cada elemento: evita montar dos veces. */
const mountedOn = new WeakMap<HTMLElement, Set<string>>();

/** Un AbortController por ciclo de montaje; se renueva en destroyAll(). */
let controller = new AbortController();

/** La promesa `ready` del ciclo actual y su resolver. */
let readyResolve: () => void = () => undefined;
let ready: Promise<void> = new Promise<void>((resolve) => {
  readyResolve = resolve;
});
let readyResolved = false;

/* -------------------------------------------------------------------------- */
/* API pública                                                                */
/* -------------------------------------------------------------------------- */

/** Registra un módulo bajo un nombre. Registrar dos veces el mismo nombre lo sobrescribe (con aviso en dev). */
export function register(name: string, mod: Module): void {
  if (import.meta.env.DEV && modules.has(name)) {
    console.warn(`[registry] "${name}" ya estaba registrado; se sobrescribe.`);
  }
  modules.set(name, mod);
}

/**
 * Monta todos los módulos registrados sobre los elementos que encuentre
 * bajo `root`. Se puede llamar con un subárbol para DOM insertado después
 * (p. ej. el overlay del menú); los elementos ya montados se saltan.
 */
export function mountAll(root: ParentNode = document): void {
  const ctx = createContext();
  const ordered = [...modules.entries()].sort(
    ([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0),
  );

  for (const [name, mod] of ordered) {
    const targets = root.querySelectorAll<HTMLElement>(mod.selector);
    for (const el of targets) {
      mountOne(name, mod, el, ctx);
    }
  }

  if (import.meta.env.DEV) {
    console.debug(`[registry] montados ${instances.length} módulos`, summary());
  }
}

/**
 * Destruye todas las instancias en orden inverso al de montaje, aborta los
 * listeners ligados a `ctx.signal` y deja el registro listo para el
 * siguiente ciclo (nueva señal, nueva promesa `ready`).
 */
export function destroyAll(): void {
  controller.abort();

  for (const inst of [...instances].reverse()) {
    try {
      inst.cleanup?.();
    } catch (error) {
      report(`cleanup de "${inst.name}"`, error);
    }
    mountedOn.get(inst.el)?.delete(inst.name);
  }
  instances = [];

  controller = new AbortController();
  readyResolved = false;
  ready = new Promise<void>((resolve) => {
    readyResolve = resolve;
  });
}

/**
 * Declara que la cortina ha terminado: resuelve `ctx.ready` del ciclo actual.
 * La llaman el preloader, la transición de página o lifecycle.ts cuando no
 * hay cortina. Idempotente.
 */
export function markReady(): void {
  if (readyResolved) return;
  readyResolved = true;
  readyResolve();
}

/** ¿Está la cortina ya abierta en este ciclo? Útil para decidir sin esperar la promesa. */
export const isReady = (): boolean => readyResolved;

/** Nombres de módulos registrados e instancias vivas (para /_kit y depuración). */
export function summary(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const name of modules.keys()) counts[name] = 0;
  for (const inst of instances) counts[inst.name] = (counts[inst.name] ?? 0) + 1;
  return counts;
}

/* -------------------------------------------------------------------------- */
/* Internos                                                                   */
/* -------------------------------------------------------------------------- */

function mountOne(name: string, mod: Module, el: HTMLElement, ctx: ModuleContext): void {
  const set = mountedOn.get(el) ?? new Set<string>();
  if (set.has(name)) return;

  try {
    const cleanup = mod.init(el, ctx) ?? undefined;
    set.add(name);
    mountedOn.set(el, set);
    instances.push({ name, el, cleanup });
  } catch (error) {
    report(`init de "${name}"`, error);
  }
}

function createContext(): ModuleContext {
  const mq = (query: string): boolean =>
    typeof window !== 'undefined' && window.matchMedia(query).matches;

  return {
    reducedMotion: mq('(prefers-reduced-motion: reduce)'),
    signal: controller.signal,
    ready,
    isMobile: mq(`(max-width: ${readBreakpoint()})`),
  };
}

/** Lee --bp-mobile de tokens.css para que el punto de corte viva en un solo sitio. */
function readBreakpoint(): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--bp-mobile').trim();
  return raw.length > 0 ? raw : '991px';
}

function report(where: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[registry] error en ${where}:`, error);
  }
}
