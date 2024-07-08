import { Component, Inject, Injector, Input, NgModule } from '@angular/core';
import { downgradeComponent, UpgradeModule, getAngularJSGlobal, getAngularLib } from '@angular/upgrade/static';
import { forEach, Resolvable, StateRegistry, UIRouter } from '@uirouter/core';
import {
  applyModuleConfig,
  NATIVE_INJECTOR_TOKEN,
  ng2LazyLoadBuilder,
  Ng2ViewConfig,
  UIView,
  _UIROUTER_SERVICE_PROVIDERS,
  UIROUTER_MODULE_TOKEN,
  UIROUTER_ROOT_MODULE,
  UIRouterModule,
  makeChildProviders,
} from '@uirouter/angular';
import { Ng1ViewConfig } from '@uirouter/angularjs';
import { UIRouterRx } from '@uirouter/rx';
import * as i0 from '@angular/core';
import * as i1 from '@uirouter/core';
import * as i2 from '@uirouter/angular';
const getAngularJS = getAngularJSGlobal || getAngularLib;
const angular = getAngularJS();
if (!angular) {
  throw new Error(
    'AngularJS not found on window.  https://github.com/ui-router/angular-hybrid/wiki/AngularJS-not-found-on-window'
  );
}
/**
 * Create a ng1 module for the ng1 half of the hybrid application to depend on.
 *
 * Example:
 * const myApp = angular.module('myApp', ['ui.router.upgrade']);
 */
export const upgradeModule = angular.module('ui.router.upgrade', ['ui.router']);
export function objectFactory() {
  return {};
}
/**
 * UIViewNgUpgrade is a component bridge from ng1 ui-view to ng2 ui-view
 *
 * When a ui-router for ng1 is registering a state it checks if a view's
 * `component:` is an ng2 Component class. If so, it creates a special ng1 template
 * which references this component, i.e., <ui-view-ng-upgrade></ui-view-ng-upgrade>
 *
 * See that code by searching ng1-to-ng2 source for: "$stateProvider.decorator"
 *
 * ---
 *
 * ng1-to-ng2 component bridge process:
 *
 * 1)
 * When an ng1 template creates a ui-view which is targeted by a ng2 Component,
 *
 * ```
 * <a ui-sref="foo">Go to foo</a>
 * <div ui-view> <!-- ui-view created in ng1 template -->
 * </div> <!-- targeted with { component: Ng2RoutedComponent } -->
 * ```
 *
 * the state decorator spits out a custom template.  That template loads this
 * ng2 Component adapter as a downgraded-to-ng1 directive.
 *
 * ```
 * <a ui-sref="foo">Go to foo</a>
 * <div ui-view> <!-- decorated template references the downgraded component -->
 *   <ui-view-ng-upgrade> <!-- downgraded adapter component -->
 *   </ui-view-ng-upgrade>
 * </div>
 * ```
 *
 * This downgraded ng2 Component then creates a child UIView (ng2 component)
 *
 * ```
 * <a ui-sref="foo">Go to foo</a>
 * <div ui-view> <!-- custom template references the downgraded component -->
 *   <ui-view-ng-upgrade> <!-- ng2 component adapter downgraded to ng1-->
 *     <ui-view> <!-- pure ng2 ui-view -->
 *      </ui-view>
 *   </ui-view-ng-upgrade>
 * </div>
 * ```
 *
 * which in turn is filled with the routed ng2 component.
 *
 * ```
 * <a ui-sref="foo">Go to foo</a>
 * <div ui-view> <!-- ng1 ui-view -->
 *   <ui-view-ng-upgrade> <!-- ng2 component adapter (downgraded to ng1)-->
 *     <ui-view> <!-- pure ng2 ui-view -->
 *       <ng2-routed-component> <!-- ng2 component hosted in ng2 ui-view -->
 *         <h1>ng2 routed component contents</h1>
 *       </ng2-routed-component>
 *     </ui-view>
 *   </ui-view-ng-upgrade>
 * </div>
 * ```
 *
 * This adapter exposes exposes the parent view context (ParentUIViewInject)
 * as an ng2 DI Provider, which the nested ng2 UIView requires.
 *
 * It gets the ParentUIViewContext information (from the parent ng1 ui-view) by walking
 * up the DOM and grabbing the .data('$uiView') which the ng1 ui-view directive exposes.
 */
export class UIViewNgUpgrade {
  // The ui-view's name (or '$default')
  name;
  constructor(
    ref,
    parent,
    registry // access the root state
  ) {
    // From the ui-view-ng-upgrade component's element ref, walk up the DOM two elements...
    // There will first be an ng1 ui-view which hosts this element, and then that ui-view's parent element.
    // That (parent) element has access to the proper "parent viewcontext"
    // The ng2 ui-view component is inside this ui-view-ng-upgrade directive, which is inside the ng1 "host" ui-view.
    // Both ui-views share the same "view context" information (the view's fqn and created-by-state context information)
    const ng1elem = angular.element(ref.nativeElement).parent().parent();
    // Expose getters on PARENT_INJECT for context (creation state) and fqn (view address)
    // These will be used by further nested UIView
    Object.defineProperty(parent, 'context', {
      get: function () {
        const data = ng1elem['inheritedData']('$uiView');
        return data && data.$cfg ? data.$cfg.viewDecl.$context : registry.root();
      },
      enumerable: true,
    });
    Object.defineProperty(parent, 'fqn', {
      get: function () {
        const data = ng1elem['inheritedData']('$uiView');
        return data && data.$uiView ? data.$uiView.fqn : null;
      },
      enumerable: true,
    });
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.0.6',
    ngImport: i0,
    type: UIViewNgUpgrade,
    deps: [{ token: i0.ElementRef }, { token: UIView.PARENT_INJECT }, { token: i1.StateRegistry }],
    target: i0.ɵɵFactoryTarget.Component,
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '14.0.0',
    version: '18.0.6',
    type: UIViewNgUpgrade,
    selector: 'ui-view-ng-upgrade',
    inputs: { name: 'name' },
    ngImport: i0,
    template: ` <ui-view [name]="name"></ui-view> `,
    isInline: true,
    dependencies: [
      {
        kind: 'component',
        type: i2.UIView,
        selector: 'ui-view, [ui-view]',
        inputs: ['name', 'ui-view'],
        exportAs: ['uiView'],
      },
    ],
    viewProviders: [{ provide: UIView.PARENT_INJECT, useFactory: objectFactory }],
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.0.6',
  ngImport: i0,
  type: UIViewNgUpgrade,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'ui-view-ng-upgrade',
          template: ` <ui-view [name]="name"></ui-view> `,
          // provide a blank object as PARENT_INJECT.
          // The component will add property getters when it is constructed.
          viewProviders: [{ provide: UIView.PARENT_INJECT, useFactory: objectFactory }],
        },
      ],
    },
  ],
  ctorParameters: () => [
    { type: i0.ElementRef },
    {
      type: undefined,
      decorators: [
        {
          type: Inject,
          args: [UIView.PARENT_INJECT],
        },
      ],
    },
    { type: i1.StateRegistry },
  ],
  propDecorators: {
    name: [
      {
        type: Input,
      },
    ],
  },
});
/**********************************
 * Ng2 @NgModule and bootstrap code
 **********************************/
// Register the ng1 DI '$uiRouter' object as an ng2 Provider.
export function uiRouterUpgradeFactory(router, injector) {
  const modules = injector.get(UIROUTER_MODULE_TOKEN, []);
  modules.forEach((module) => applyModuleConfig(router, injector, module));
  return router;
}
export function getUIRouter($injector) {
  return $injector.get('$uiRouter');
}
export function getParentUIViewInject(r) {
  return { fqn: null, context: r.root() };
}
/**
 * This NgModule should be added to the root module of the hybrid app.
 */
export class UIRouterUpgradeModule {
  static forRoot(module = {}) {
    return {
      ngModule: UIRouterUpgradeModule,
      providers: makeChildProviders(module),
    };
  }
  static forChild(module = {}) {
    return {
      ngModule: UIRouterModule,
      providers: makeChildProviders(module),
    };
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.0.6',
    ngImport: i0,
    type: UIRouterUpgradeModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule,
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: '14.0.0',
    version: '18.0.6',
    ngImport: i0,
    type: UIRouterUpgradeModule,
    declarations: [UIViewNgUpgrade],
    imports: [UIRouterModule, UpgradeModule],
    exports: [UIViewNgUpgrade, UIRouterModule],
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: '12.0.0',
    version: '18.0.6',
    ngImport: i0,
    type: UIRouterUpgradeModule,
    providers: [
      // @uirouter/angular code will use the ng1 $uiRouter instance instead of creating its own.
      { provide: '$uiRouter', useFactory: getUIRouter, deps: ['$injector'] },
      { provide: UIRouter, useFactory: uiRouterUpgradeFactory, deps: ['$uiRouter', Injector] },
      { provide: UIROUTER_ROOT_MODULE, useValue: {}, multi: true },
      { provide: UIView.PARENT_INJECT, useFactory: getParentUIViewInject, deps: [StateRegistry] },
      ..._UIROUTER_SERVICE_PROVIDERS,
    ],
    imports: [UIRouterModule, UpgradeModule, UIRouterModule],
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.0.6',
  ngImport: i0,
  type: UIRouterUpgradeModule,
  decorators: [
    {
      type: NgModule,
      args: [
        {
          imports: [UIRouterModule, UpgradeModule],
          declarations: [UIViewNgUpgrade],
          providers: [
            // @uirouter/angular code will use the ng1 $uiRouter instance instead of creating its own.
            { provide: '$uiRouter', useFactory: getUIRouter, deps: ['$injector'] },
            { provide: UIRouter, useFactory: uiRouterUpgradeFactory, deps: ['$uiRouter', Injector] },
            { provide: UIROUTER_ROOT_MODULE, useValue: {}, multi: true },
            { provide: UIView.PARENT_INJECT, useFactory: getParentUIViewInject, deps: [StateRegistry] },
            ..._UIROUTER_SERVICE_PROVIDERS,
          ],
          exports: [UIViewNgUpgrade, UIRouterModule],
        },
      ],
    },
  ],
});
// Downgrade the UIViewNgUpgrade ng2 Component to an ng1 directive.
// The directive is used in a (generated) view template by the (host) ng1 ui-router,
// whenever it finds a view configured with a `component: <Ng2ComponentClass>`
upgradeModule.directive(
  'uiViewNgUpgrade',
  downgradeComponent({
    component: UIViewNgUpgrade,
    inputs: ['name'],
  })
);
upgradeModule.run([
  '$injector',
  (ng1Injector) => {
    const $uiRouter = ng1Injector.get('$uiRouter');
    /** Add support for observable state and param changes */
    $uiRouter.plugin(UIRouterRx);
    // Expose a merged ng1/ng2 injector as a Resolvable (on the root state).
    // This mimics how ui-router-ng2 exposes the root ng2 Injector, but
    // it retrieves from ng1 injector first, then ng2 injector if the token isn't found.
    const mergedInjector = {
      get: function (token, ng2NotFoundValue) {
        if (ng1Injector.has(token)) {
          return ng1Injector.get(token);
        }
        const ng2Injector = ng1Injector.get('$$angularInjector');
        return ng2Injector.get(token, ng2NotFoundValue);
      },
    };
    const ng2InjectorResolvable = Resolvable.fromData(NATIVE_INJECTOR_TOKEN, mergedInjector);
    $uiRouter.stateRegistry.root().resolvables.push(ng2InjectorResolvable);
  },
]);
/** Adds support for `loadChildren`: Angular NgModule lazy loading via @gntools/webpack */
upgradeModule.config([
  '$stateRegistryProvider',
  ($stateRegistry) => {
    $stateRegistry.decorator('lazyLoad', ng2LazyLoadBuilder);
  },
]);
/**
 * Define a stateProvider `views` builder decorator.
 * The decorator first applies the standard views builder function.
 * Then it finds any view components which are **actually** a Ng2 Component Class.
 * It overwrites that view's config with a ng1-to-ng2 hybrid config.
 *
 * In place of the template provider, it simply puts a <ui-view-ng-upgrade/> component
 * which that provides a ng1 -> ng2 boundary in the component tree.
 */
upgradeModule.config([
  '$stateRegistryProvider',
  ($stateRegistry) => {
    $stateRegistry.decorator('views', function (state, parentFn) {
      const views = parentFn(state);
      forEach(views, (viewDecl, viewName) => {
        if (viewDecl.$type === 'ng1-to-ng2' || typeof viewDecl.component === 'function') {
          // Update the view config.
          // Override default ng1 `component:` behavior (of defining a templateProvider)
          // with a <ui-view-ng-upgrade> adapter directive template
          viewDecl.$type = 'ng1-to-ng2';
          viewDecl.templateProvider = null;
          viewDecl.template = `<ui-view-ng-upgrade name='${viewDecl.$uiViewName}'></ui-view-ng-upgrade>`;
        }
      });
      return views;
    });
  },
]);
// UI-Router ViewConfig factories take a view declaration object from a state.views: { foo: <ViewDeclaration> }
// and return a runtime config object (a ViewConfig)
upgradeModule.run([
  '$view',
  '$templateFactory',
  ($view, $templateFactory) => {
    // Register a ViewConfig factory for views of type `ng2`
    $view._pluginapi._viewConfigFactory('ng2', (path, config) => new Ng2ViewConfig(path, config));
    // Register a ViewConfig factory for views of type `ng1-to-ng2`.
    // Returns both an ng1 config and an ng2 config allowing either ng1 or ng2 ui-view components to be targeted.
    $view._pluginapi._viewConfigFactory('ng1-to-ng2', (path, config) => {
      const ng1ViewConfig = new Ng1ViewConfig(path, Object.assign({}, config, { $type: 'ng1' }), $templateFactory);
      const ng2ViewConfig = new Ng2ViewConfig(path, Object.assign({}, config, { $type: 'ng2' }));
      return [ng2ViewConfig, ng1ViewConfig];
    });
  },
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1oeWJyaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYW5ndWxhci1oeWJyaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBYyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlHLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFL0csT0FBTyxFQUVMLE9BQU8sRUFFUCxVQUFVLEVBQ1YsYUFBYSxFQUNiLFFBQVEsR0FHVCxNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFDTCxpQkFBaUIsRUFDakIscUJBQXFCLEVBQ3JCLGtCQUFrQixFQUNsQixhQUFhLEVBQ2IsTUFBTSxFQUNOLDJCQUEyQixFQUkzQixxQkFBcUIsRUFDckIsb0JBQW9CLEVBQ3BCLGNBQWMsRUFDZCxrQkFBa0IsR0FDbkIsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixPQUFPLEVBQWlCLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRW5FLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7Ozs7QUFHMUMsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLElBQUksYUFBYSxDQUFDO0FBQ3pELE1BQU0sT0FBTyxHQUFHLFlBQVksRUFBRSxDQUFDO0FBRS9CLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNiLE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0hBQWdILENBQ2pILENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFFaEYsTUFBTSxVQUFVLGFBQWE7SUFDM0IsT0FBTyxFQUFFLENBQUM7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S0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FDL0UsQ0FBQztZQUVGLE9BQU8sQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdG9yLCBJbnB1dCwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGRvd25ncmFkZUNvbXBvbmVudCwgVXBncmFkZU1vZHVsZSwgZ2V0QW5ndWxhckpTR2xvYmFsLCBnZXRBbmd1bGFyTGliIH0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuXG5pbXBvcnQge1xuICBTdGF0ZU9iamVjdCxcbiAgZm9yRWFjaCxcbiAgUGF0aE5vZGUsXG4gIFJlc29sdmFibGUsXG4gIFN0YXRlUmVnaXN0cnksXG4gIFVJUm91dGVyLFxuICBWaWV3Q29uZmlnLFxuICBWaWV3U2VydmljZSxcbn0gZnJvbSAnQHVpcm91dGVyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBhcHBseU1vZHVsZUNvbmZpZyxcbiAgTkFUSVZFX0lOSkVDVE9SX1RPS0VOLFxuICBuZzJMYXp5TG9hZEJ1aWxkZXIsXG4gIE5nMlZpZXdDb25maWcsXG4gIFVJVmlldyxcbiAgX1VJUk9VVEVSX1NFUlZJQ0VfUFJPVklERVJTLFxuICBOZzJWaWV3RGVjbGFyYXRpb24sXG4gIFBhcmVudFVJVmlld0luamVjdCxcbiAgU3RhdGVzTW9kdWxlLFxuICBVSVJPVVRFUl9NT0RVTEVfVE9LRU4sXG4gIFVJUk9VVEVSX1JPT1RfTU9EVUxFLFxuICBVSVJvdXRlck1vZHVsZSxcbiAgbWFrZUNoaWxkUHJvdmlkZXJzLFxufSBmcm9tICdAdWlyb3V0ZXIvYW5ndWxhcic7XG5cbmltcG9ydCB7ICRJbmplY3Rvckxpa2UsIE5nMVZpZXdDb25maWcgfSBmcm9tICdAdWlyb3V0ZXIvYW5ndWxhcmpzJztcblxuaW1wb3J0IHsgVUlSb3V0ZXJSeCB9IGZyb20gJ0B1aXJvdXRlci9yeCc7XG5pbXBvcnQgeyBOZ0h5YnJpZFN0YXRlc01vZHVsZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmNvbnN0IGdldEFuZ3VsYXJKUyA9IGdldEFuZ3VsYXJKU0dsb2JhbCB8fCBnZXRBbmd1bGFyTGliO1xuY29uc3QgYW5ndWxhciA9IGdldEFuZ3VsYXJKUygpO1xuXG5pZiAoIWFuZ3VsYXIpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICdBbmd1bGFySlMgbm90IGZvdW5kIG9uIHdpbmRvdy4gIGh0dHBzOi8vZ2l0aHViLmNvbS91aS1yb3V0ZXIvYW5ndWxhci1oeWJyaWQvd2lraS9Bbmd1bGFySlMtbm90LWZvdW5kLW9uLXdpbmRvdydcbiAgKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZzEgbW9kdWxlIGZvciB0aGUgbmcxIGhhbGYgb2YgdGhlIGh5YnJpZCBhcHBsaWNhdGlvbiB0byBkZXBlbmQgb24uXG4gKlxuICogRXhhbXBsZTpcbiAqIGNvbnN0IG15QXBwID0gYW5ndWxhci5tb2R1bGUoJ215QXBwJywgWyd1aS5yb3V0ZXIudXBncmFkZSddKTtcbiAqL1xuZXhwb3J0IGNvbnN0IHVwZ3JhZGVNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnVwZ3JhZGUnLCBbJ3VpLnJvdXRlciddKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdEZhY3RvcnkoKSB7XG4gIHJldHVybiB7fTtcbn1cblxuLyoqXG4gKiBVSVZpZXdOZ1VwZ3JhZGUgaXMgYSBjb21wb25lbnQgYnJpZGdlIGZyb20gbmcxIHVpLXZpZXcgdG8gbmcyIHVpLXZpZXdcbiAqXG4gKiBXaGVuIGEgdWktcm91dGVyIGZvciBuZzEgaXMgcmVnaXN0ZXJpbmcgYSBzdGF0ZSBpdCBjaGVja3MgaWYgYSB2aWV3J3NcbiAqIGBjb21wb25lbnQ6YCBpcyBhbiBuZzIgQ29tcG9uZW50IGNsYXNzLiBJZiBzbywgaXQgY3JlYXRlcyBhIHNwZWNpYWwgbmcxIHRlbXBsYXRlXG4gKiB3aGljaCByZWZlcmVuY2VzIHRoaXMgY29tcG9uZW50LCBpLmUuLCA8dWktdmlldy1uZy11cGdyYWRlPjwvdWktdmlldy1uZy11cGdyYWRlPlxuICpcbiAqIFNlZSB0aGF0IGNvZGUgYnkgc2VhcmNoaW5nIG5nMS10by1uZzIgc291cmNlIGZvcjogXCIkc3RhdGVQcm92aWRlci5kZWNvcmF0b3JcIlxuICpcbiAqIC0tLVxuICpcbiAqIG5nMS10by1uZzIgY29tcG9uZW50IGJyaWRnZSBwcm9jZXNzOlxuICpcbiAqIDEpXG4gKiBXaGVuIGFuIG5nMSB0ZW1wbGF0ZSBjcmVhdGVzIGEgdWktdmlldyB3aGljaCBpcyB0YXJnZXRlZCBieSBhIG5nMiBDb21wb25lbnQsXG4gKlxuICogYGBgXG4gKiA8YSB1aS1zcmVmPVwiZm9vXCI+R28gdG8gZm9vPC9hPlxuICogPGRpdiB1aS12aWV3PiA8IS0tIHVpLXZpZXcgY3JlYXRlZCBpbiBuZzEgdGVtcGxhdGUgLS0+XG4gKiA8L2Rpdj4gPCEtLSB0YXJnZXRlZCB3aXRoIHsgY29tcG9uZW50OiBOZzJSb3V0ZWRDb21wb25lbnQgfSAtLT5cbiAqIGBgYFxuICpcbiAqIHRoZSBzdGF0ZSBkZWNvcmF0b3Igc3BpdHMgb3V0IGEgY3VzdG9tIHRlbXBsYXRlLiAgVGhhdCB0ZW1wbGF0ZSBsb2FkcyB0aGlzXG4gKiBuZzIgQ29tcG9uZW50IGFkYXB0ZXIgYXMgYSBkb3duZ3JhZGVkLXRvLW5nMSBkaXJlY3RpdmUuXG4gKlxuICogYGBgXG4gKiA8YSB1aS1zcmVmPVwiZm9vXCI+R28gdG8gZm9vPC9hPlxuICogPGRpdiB1aS12aWV3PiA8IS0tIGRlY29yYXRlZCB0ZW1wbGF0ZSByZWZlcmVuY2VzIHRoZSBkb3duZ3JhZGVkIGNvbXBvbmVudCAtLT5cbiAqICAgPHVpLXZpZXctbmctdXBncmFkZT4gPCEtLSBkb3duZ3JhZGVkIGFkYXB0ZXIgY29tcG9uZW50IC0tPlxuICogICA8L3VpLXZpZXctbmctdXBncmFkZT5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogVGhpcyBkb3duZ3JhZGVkIG5nMiBDb21wb25lbnQgdGhlbiBjcmVhdGVzIGEgY2hpbGQgVUlWaWV3IChuZzIgY29tcG9uZW50KVxuICpcbiAqIGBgYFxuICogPGEgdWktc3JlZj1cImZvb1wiPkdvIHRvIGZvbzwvYT5cbiAqIDxkaXYgdWktdmlldz4gPCEtLSBjdXN0b20gdGVtcGxhdGUgcmVmZXJlbmNlcyB0aGUgZG93bmdyYWRlZCBjb21wb25lbnQgLS0+XG4gKiAgIDx1aS12aWV3LW5nLXVwZ3JhZGU+IDwhLS0gbmcyIGNvbXBvbmVudCBhZGFwdGVyIGRvd25ncmFkZWQgdG8gbmcxLS0+XG4gKiAgICAgPHVpLXZpZXc+IDwhLS0gcHVyZSBuZzIgdWktdmlldyAtLT5cbiAqICAgICAgPC91aS12aWV3PlxuICogICA8L3VpLXZpZXctbmctdXBncmFkZT5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogd2hpY2ggaW4gdHVybiBpcyBmaWxsZWQgd2l0aCB0aGUgcm91dGVkIG5nMiBjb21wb25lbnQuXG4gKlxuICogYGBgXG4gKiA8YSB1aS1zcmVmPVwiZm9vXCI+R28gdG8gZm9vPC9hPlxuICogPGRpdiB1aS12aWV3PiA8IS0tIG5nMSB1aS12aWV3IC0tPlxuICogICA8dWktdmlldy1uZy11cGdyYWRlPiA8IS0tIG5nMiBjb21wb25lbnQgYWRhcHRlciAoZG93bmdyYWRlZCB0byBuZzEpLS0+XG4gKiAgICAgPHVpLXZpZXc+IDwhLS0gcHVyZSBuZzIgdWktdmlldyAtLT5cbiAqICAgICAgIDxuZzItcm91dGVkLWNvbXBvbmVudD4gPCEtLSBuZzIgY29tcG9uZW50IGhvc3RlZCBpbiBuZzIgdWktdmlldyAtLT5cbiAqICAgICAgICAgPGgxPm5nMiByb3V0ZWQgY29tcG9uZW50IGNvbnRlbnRzPC9oMT5cbiAqICAgICAgIDwvbmcyLXJvdXRlZC1jb21wb25lbnQ+XG4gKiAgICAgPC91aS12aWV3PlxuICogICA8L3VpLXZpZXctbmctdXBncmFkZT5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogVGhpcyBhZGFwdGVyIGV4cG9zZXMgZXhwb3NlcyB0aGUgcGFyZW50IHZpZXcgY29udGV4dCAoUGFyZW50VUlWaWV3SW5qZWN0KVxuICogYXMgYW4gbmcyIERJIFByb3ZpZGVyLCB3aGljaCB0aGUgbmVzdGVkIG5nMiBVSVZpZXcgcmVxdWlyZXMuXG4gKlxuICogSXQgZ2V0cyB0aGUgUGFyZW50VUlWaWV3Q29udGV4dCBpbmZvcm1hdGlvbiAoZnJvbSB0aGUgcGFyZW50IG5nMSB1aS12aWV3KSBieSB3YWxraW5nXG4gKiB1cCB0aGUgRE9NIGFuZCBncmFiYmluZyB0aGUgLmRhdGEoJyR1aVZpZXcnKSB3aGljaCB0aGUgbmcxIHVpLXZpZXcgZGlyZWN0aXZlIGV4cG9zZXMuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3VpLXZpZXctbmctdXBncmFkZScsXG4gIHRlbXBsYXRlOiBgIDx1aS12aWV3IFtuYW1lXT1cIm5hbWVcIj48L3VpLXZpZXc+IGAsXG4gIC8vIHByb3ZpZGUgYSBibGFuayBvYmplY3QgYXMgUEFSRU5UX0lOSkVDVC5cbiAgLy8gVGhlIGNvbXBvbmVudCB3aWxsIGFkZCBwcm9wZXJ0eSBnZXR0ZXJzIHdoZW4gaXQgaXMgY29uc3RydWN0ZWQuXG4gIHZpZXdQcm92aWRlcnM6IFt7IHByb3ZpZGU6IFVJVmlldy5QQVJFTlRfSU5KRUNULCB1c2VGYWN0b3J5OiBvYmplY3RGYWN0b3J5IH1dLFxufSlcbmV4cG9ydCBjbGFzcyBVSVZpZXdOZ1VwZ3JhZGUge1xuICAvLyBUaGUgdWktdmlldydzIG5hbWUgKG9yICckZGVmYXVsdCcpXG4gIEBJbnB1dCgpXG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWY6IEVsZW1lbnRSZWYsXG4gICAgQEluamVjdChVSVZpZXcuUEFSRU5UX0lOSkVDVCkgcGFyZW50OiBQYXJlbnRVSVZpZXdJbmplY3QsXG4gICAgcmVnaXN0cnk6IFN0YXRlUmVnaXN0cnkgLy8gYWNjZXNzIHRoZSByb290IHN0YXRlXG4gICkge1xuICAgIC8vIEZyb20gdGhlIHVpLXZpZXctbmctdXBncmFkZSBjb21wb25lbnQncyBlbGVtZW50IHJlZiwgd2FsayB1cCB0aGUgRE9NIHR3byBlbGVtZW50cy4uLlxuICAgIC8vIFRoZXJlIHdpbGwgZmlyc3QgYmUgYW4gbmcxIHVpLXZpZXcgd2hpY2ggaG9zdHMgdGhpcyBlbGVtZW50LCBhbmQgdGhlbiB0aGF0IHVpLXZpZXcncyBwYXJlbnQgZWxlbWVudC5cbiAgICAvLyBUaGF0IChwYXJlbnQpIGVsZW1lbnQgaGFzIGFjY2VzcyB0byB0aGUgcHJvcGVyIFwicGFyZW50IHZpZXdjb250ZXh0XCJcblxuICAgIC8vIFRoZSBuZzIgdWktdmlldyBjb21wb25lbnQgaXMgaW5zaWRlIHRoaXMgdWktdmlldy1uZy11cGdyYWRlIGRpcmVjdGl2ZSwgd2hpY2ggaXMgaW5zaWRlIHRoZSBuZzEgXCJob3N0XCIgdWktdmlldy5cbiAgICAvLyBCb3RoIHVpLXZpZXdzIHNoYXJlIHRoZSBzYW1lIFwidmlldyBjb250ZXh0XCIgaW5mb3JtYXRpb24gKHRoZSB2aWV3J3MgZnFuIGFuZCBjcmVhdGVkLWJ5LXN0YXRlIGNvbnRleHQgaW5mb3JtYXRpb24pXG4gICAgY29uc3QgbmcxZWxlbSA9IGFuZ3VsYXIuZWxlbWVudChyZWYubmF0aXZlRWxlbWVudCkucGFyZW50KCkucGFyZW50KCk7XG5cbiAgICAvLyBFeHBvc2UgZ2V0dGVycyBvbiBQQVJFTlRfSU5KRUNUIGZvciBjb250ZXh0IChjcmVhdGlvbiBzdGF0ZSkgYW5kIGZxbiAodmlldyBhZGRyZXNzKVxuICAgIC8vIFRoZXNlIHdpbGwgYmUgdXNlZCBieSBmdXJ0aGVyIG5lc3RlZCBVSVZpZXdcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFyZW50LCAnY29udGV4dCcsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBkYXRhID0gbmcxZWxlbVsnaW5oZXJpdGVkRGF0YSddKCckdWlWaWV3Jyk7XG4gICAgICAgIHJldHVybiBkYXRhICYmIGRhdGEuJGNmZyA/IGRhdGEuJGNmZy52aWV3RGVjbC4kY29udGV4dCA6IHJlZ2lzdHJ5LnJvb3QoKTtcbiAgICAgIH0sXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcmVudCwgJ2ZxbicsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBkYXRhID0gbmcxZWxlbVsnaW5oZXJpdGVkRGF0YSddKCckdWlWaWV3Jyk7XG4gICAgICAgIHJldHVybiBkYXRhICYmIGRhdGEuJHVpVmlldyA/IGRhdGEuJHVpVmlldy5mcW4gOiBudWxsO1xuICAgICAgfSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE5nMiBATmdNb2R1bGUgYW5kIGJvb3RzdHJhcCBjb2RlXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gUmVnaXN0ZXIgdGhlIG5nMSBESSAnJHVpUm91dGVyJyBvYmplY3QgYXMgYW4gbmcyIFByb3ZpZGVyLlxuZXhwb3J0IGZ1bmN0aW9uIHVpUm91dGVyVXBncmFkZUZhY3Rvcnkocm91dGVyOiBVSVJvdXRlciwgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gIGNvbnN0IG1vZHVsZXM6IFN0YXRlc01vZHVsZVtdID0gaW5qZWN0b3IuZ2V0PFN0YXRlc01vZHVsZVtdPihVSVJPVVRFUl9NT0RVTEVfVE9LRU4sIFtdKTtcbiAgbW9kdWxlcy5mb3JFYWNoKChtb2R1bGUpID0+IGFwcGx5TW9kdWxlQ29uZmlnKHJvdXRlciwgaW5qZWN0b3IsIG1vZHVsZSkpO1xuICByZXR1cm4gcm91dGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VUlSb3V0ZXIoJGluamVjdG9yOiBhbnkpIHtcbiAgcmV0dXJuICRpbmplY3Rvci5nZXQoJyR1aVJvdXRlcicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyZW50VUlWaWV3SW5qZWN0KHI6IFN0YXRlUmVnaXN0cnkpOiBQYXJlbnRVSVZpZXdJbmplY3Qge1xuICByZXR1cm4geyBmcW46IG51bGwsIGNvbnRleHQ6IHIucm9vdCgpIH07XG59XG5cbi8qKlxuICogVGhpcyBOZ01vZHVsZSBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHJvb3QgbW9kdWxlIG9mIHRoZSBoeWJyaWQgYXBwLlxuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbVUlSb3V0ZXJNb2R1bGUsIFVwZ3JhZGVNb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtVSVZpZXdOZ1VwZ3JhZGVdLFxuICBwcm92aWRlcnM6IFtcbiAgICAvLyBAdWlyb3V0ZXIvYW5ndWxhciBjb2RlIHdpbGwgdXNlIHRoZSBuZzEgJHVpUm91dGVyIGluc3RhbmNlIGluc3RlYWQgb2YgY3JlYXRpbmcgaXRzIG93bi5cbiAgICB7IHByb3ZpZGU6ICckdWlSb3V0ZXInLCB1c2VGYWN0b3J5OiBnZXRVSVJvdXRlciwgZGVwczogWyckaW5qZWN0b3InXSB9LFxuXG4gICAgeyBwcm92aWRlOiBVSVJvdXRlciwgdXNlRmFjdG9yeTogdWlSb3V0ZXJVcGdyYWRlRmFjdG9yeSwgZGVwczogWyckdWlSb3V0ZXInLCBJbmplY3Rvcl0gfSxcblxuICAgIHsgcHJvdmlkZTogVUlST1VURVJfUk9PVF9NT0RVTEUsIHVzZVZhbHVlOiB7fSwgbXVsdGk6IHRydWUgfSxcblxuICAgIHsgcHJvdmlkZTogVUlWaWV3LlBBUkVOVF9JTkpFQ1QsIHVzZUZhY3Rvcnk6IGdldFBhcmVudFVJVmlld0luamVjdCwgZGVwczogW1N0YXRlUmVnaXN0cnldIH0sXG5cbiAgICAuLi5fVUlST1VURVJfU0VSVklDRV9QUk9WSURFUlMsXG4gIF0sXG4gIGV4cG9ydHM6IFtVSVZpZXdOZ1VwZ3JhZGUsIFVJUm91dGVyTW9kdWxlXSxcbn0pXG5leHBvcnQgY2xhc3MgVUlSb3V0ZXJVcGdyYWRlTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QobW9kdWxlOiBOZ0h5YnJpZFN0YXRlc01vZHVsZSA9IHt9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxVSVJvdXRlclVwZ3JhZGVNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFVJUm91dGVyVXBncmFkZU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogbWFrZUNoaWxkUHJvdmlkZXJzKG1vZHVsZSBhcyBTdGF0ZXNNb2R1bGUpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZm9yQ2hpbGQobW9kdWxlOiBOZ0h5YnJpZFN0YXRlc01vZHVsZSA9IHt9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxVSVJvdXRlclVwZ3JhZGVNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFVJUm91dGVyTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBtYWtlQ2hpbGRQcm92aWRlcnMobW9kdWxlIGFzIFN0YXRlc01vZHVsZSksXG4gICAgfTtcbiAgfVxufVxuXG4vLyBEb3duZ3JhZGUgdGhlIFVJVmlld05nVXBncmFkZSBuZzIgQ29tcG9uZW50IHRvIGFuIG5nMSBkaXJlY3RpdmUuXG4vLyBUaGUgZGlyZWN0aXZlIGlzIHVzZWQgaW4gYSAoZ2VuZXJhdGVkKSB2aWV3IHRlbXBsYXRlIGJ5IHRoZSAoaG9zdCkgbmcxIHVpLXJvdXRlcixcbi8vIHdoZW5ldmVyIGl0IGZpbmRzIGEgdmlldyBjb25maWd1cmVkIHdpdGggYSBgY29tcG9uZW50OiA8TmcyQ29tcG9uZW50Q2xhc3M+YFxudXBncmFkZU1vZHVsZS5kaXJlY3RpdmUoXG4gICd1aVZpZXdOZ1VwZ3JhZGUnLFxuICA8YW55PmRvd25ncmFkZUNvbXBvbmVudCh7XG4gICAgY29tcG9uZW50OiBVSVZpZXdOZ1VwZ3JhZGUsXG4gICAgaW5wdXRzOiBbJ25hbWUnXSxcbiAgfSlcbik7XG5cbnVwZ3JhZGVNb2R1bGUucnVuKFtcbiAgJyRpbmplY3RvcicsXG4gIChuZzFJbmplY3RvcjogJEluamVjdG9yTGlrZSkgPT4ge1xuICAgIGNvbnN0ICR1aVJvdXRlcjogVUlSb3V0ZXIgPSBuZzFJbmplY3Rvci5nZXQoJyR1aVJvdXRlcicpO1xuXG4gICAgLyoqIEFkZCBzdXBwb3J0IGZvciBvYnNlcnZhYmxlIHN0YXRlIGFuZCBwYXJhbSBjaGFuZ2VzICovXG4gICAgJHVpUm91dGVyLnBsdWdpbihVSVJvdXRlclJ4KTtcblxuICAgIC8vIEV4cG9zZSBhIG1lcmdlZCBuZzEvbmcyIGluamVjdG9yIGFzIGEgUmVzb2x2YWJsZSAob24gdGhlIHJvb3Qgc3RhdGUpLlxuICAgIC8vIFRoaXMgbWltaWNzIGhvdyB1aS1yb3V0ZXItbmcyIGV4cG9zZXMgdGhlIHJvb3QgbmcyIEluamVjdG9yLCBidXRcbiAgICAvLyBpdCByZXRyaWV2ZXMgZnJvbSBuZzEgaW5qZWN0b3IgZmlyc3QsIHRoZW4gbmcyIGluamVjdG9yIGlmIHRoZSB0b2tlbiBpc24ndCBmb3VuZC5cbiAgICBjb25zdCBtZXJnZWRJbmplY3RvciA9IHtcbiAgICAgIGdldDogZnVuY3Rpb24gKHRva2VuOiBhbnksIG5nMk5vdEZvdW5kVmFsdWU/OiBhbnkpIHtcbiAgICAgICAgaWYgKG5nMUluamVjdG9yLmhhcyh0b2tlbikpIHtcbiAgICAgICAgICByZXR1cm4gbmcxSW5qZWN0b3IuZ2V0KHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZzJJbmplY3RvciA9IG5nMUluamVjdG9yLmdldCgnJCRhbmd1bGFySW5qZWN0b3InKTtcbiAgICAgICAgcmV0dXJuIG5nMkluamVjdG9yLmdldCh0b2tlbiwgbmcyTm90Rm91bmRWYWx1ZSk7XG4gICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCBuZzJJbmplY3RvclJlc29sdmFibGUgPSBSZXNvbHZhYmxlLmZyb21EYXRhKE5BVElWRV9JTkpFQ1RPUl9UT0tFTiwgbWVyZ2VkSW5qZWN0b3IpO1xuICAgICR1aVJvdXRlci5zdGF0ZVJlZ2lzdHJ5LnJvb3QoKS5yZXNvbHZhYmxlcy5wdXNoKG5nMkluamVjdG9yUmVzb2x2YWJsZSk7XG4gIH0sXG5dKTtcblxuLyoqIEFkZHMgc3VwcG9ydCBmb3IgYGxvYWRDaGlsZHJlbmA6IEFuZ3VsYXIgTmdNb2R1bGUgbGF6eSBsb2FkaW5nIHZpYSBAZ250b29scy93ZWJwYWNrICovXG51cGdyYWRlTW9kdWxlLmNvbmZpZyhbXG4gICckc3RhdGVSZWdpc3RyeVByb3ZpZGVyJyxcbiAgKCRzdGF0ZVJlZ2lzdHJ5OiBTdGF0ZVJlZ2lzdHJ5KSA9PiB7XG4gICAgJHN0YXRlUmVnaXN0cnkuZGVjb3JhdG9yKCdsYXp5TG9hZCcsIG5nMkxhenlMb2FkQnVpbGRlcik7XG4gIH0sXG5dKTtcblxuLyoqXG4gKiBEZWZpbmUgYSBzdGF0ZVByb3ZpZGVyIGB2aWV3c2AgYnVpbGRlciBkZWNvcmF0b3IuXG4gKiBUaGUgZGVjb3JhdG9yIGZpcnN0IGFwcGxpZXMgdGhlIHN0YW5kYXJkIHZpZXdzIGJ1aWxkZXIgZnVuY3Rpb24uXG4gKiBUaGVuIGl0IGZpbmRzIGFueSB2aWV3IGNvbXBvbmVudHMgd2hpY2ggYXJlICoqYWN0dWFsbHkqKiBhIE5nMiBDb21wb25lbnQgQ2xhc3MuXG4gKiBJdCBvdmVyd3JpdGVzIHRoYXQgdmlldydzIGNvbmZpZyB3aXRoIGEgbmcxLXRvLW5nMiBoeWJyaWQgY29uZmlnLlxuICpcbiAqIEluIHBsYWNlIG9mIHRoZSB0ZW1wbGF0ZSBwcm92aWRlciwgaXQgc2ltcGx5IHB1dHMgYSA8dWktdmlldy1uZy11cGdyYWRlLz4gY29tcG9uZW50XG4gKiB3aGljaCB0aGF0IHByb3ZpZGVzIGEgbmcxIC0+IG5nMiBib3VuZGFyeSBpbiB0aGUgY29tcG9uZW50IHRyZWUuXG4gKi9cbnVwZ3JhZGVNb2R1bGUuY29uZmlnKFtcbiAgJyRzdGF0ZVJlZ2lzdHJ5UHJvdmlkZXInLFxuICAoJHN0YXRlUmVnaXN0cnk6IFN0YXRlUmVnaXN0cnkpID0+IHtcbiAgICAkc3RhdGVSZWdpc3RyeS5kZWNvcmF0b3IoJ3ZpZXdzJywgZnVuY3Rpb24gKHN0YXRlOiBTdGF0ZU9iamVjdCwgcGFyZW50Rm46IEZ1bmN0aW9uKSB7XG4gICAgICBjb25zdCB2aWV3cyA9IHBhcmVudEZuKHN0YXRlKTtcblxuICAgICAgZm9yRWFjaCh2aWV3cywgKHZpZXdEZWNsOiBhbnksIHZpZXdOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHZpZXdEZWNsLiR0eXBlID09PSAnbmcxLXRvLW5nMicgfHwgdHlwZW9mIHZpZXdEZWNsLmNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgdmlldyBjb25maWcuXG4gICAgICAgICAgLy8gT3ZlcnJpZGUgZGVmYXVsdCBuZzEgYGNvbXBvbmVudDpgIGJlaGF2aW9yIChvZiBkZWZpbmluZyBhIHRlbXBsYXRlUHJvdmlkZXIpXG4gICAgICAgICAgLy8gd2l0aCBhIDx1aS12aWV3LW5nLXVwZ3JhZGU+IGFkYXB0ZXIgZGlyZWN0aXZlIHRlbXBsYXRlXG4gICAgICAgICAgdmlld0RlY2wuJHR5cGUgPSAnbmcxLXRvLW5nMic7XG4gICAgICAgICAgdmlld0RlY2wudGVtcGxhdGVQcm92aWRlciA9IG51bGw7XG4gICAgICAgICAgdmlld0RlY2wudGVtcGxhdGUgPSBgPHVpLXZpZXctbmctdXBncmFkZSBuYW1lPScke3ZpZXdEZWNsLiR1aVZpZXdOYW1lfSc+PC91aS12aWV3LW5nLXVwZ3JhZGU+YDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdmlld3M7XG4gICAgfSk7XG4gIH0sXG5dKTtcblxuLy8gVUktUm91dGVyIFZpZXdDb25maWcgZmFjdG9yaWVzIHRha2UgYSB2aWV3IGRlY2xhcmF0aW9uIG9iamVjdCBmcm9tIGEgc3RhdGUudmlld3M6IHsgZm9vOiA8Vmlld0RlY2xhcmF0aW9uPiB9XG4vLyBhbmQgcmV0dXJuIGEgcnVudGltZSBjb25maWcgb2JqZWN0IChhIFZpZXdDb25maWcpXG51cGdyYWRlTW9kdWxlLnJ1bihbXG4gICckdmlldycsXG4gICckdGVtcGxhdGVGYWN0b3J5JyxcbiAgKCR2aWV3OiBWaWV3U2VydmljZSwgJHRlbXBsYXRlRmFjdG9yeTogYW55KSA9PiB7XG4gICAgLy8gUmVnaXN0ZXIgYSBWaWV3Q29uZmlnIGZhY3RvcnkgZm9yIHZpZXdzIG9mIHR5cGUgYG5nMmBcbiAgICAkdmlldy5fcGx1Z2luYXBpLl92aWV3Q29uZmlnRmFjdG9yeShcbiAgICAgICduZzInLFxuICAgICAgKHBhdGg6IFBhdGhOb2RlW10sIGNvbmZpZzogTmcyVmlld0RlY2xhcmF0aW9uKSA9PiBuZXcgTmcyVmlld0NvbmZpZyhwYXRoLCBjb25maWcpXG4gICAgKTtcblxuICAgIC8vIFJlZ2lzdGVyIGEgVmlld0NvbmZpZyBmYWN0b3J5IGZvciB2aWV3cyBvZiB0eXBlIGBuZzEtdG8tbmcyYC5cbiAgICAvLyBSZXR1cm5zIGJvdGggYW4gbmcxIGNvbmZpZyBhbmQgYW4gbmcyIGNvbmZpZyBhbGxvd2luZyBlaXRoZXIgbmcxIG9yIG5nMiB1aS12aWV3IGNvbXBvbmVudHMgdG8gYmUgdGFyZ2V0ZWQuXG4gICAgJHZpZXcuX3BsdWdpbmFwaS5fdmlld0NvbmZpZ0ZhY3RvcnkoJ25nMS10by1uZzInLCAocGF0aDogUGF0aE5vZGVbXSwgY29uZmlnOiBOZzJWaWV3RGVjbGFyYXRpb24pID0+IHtcbiAgICAgIGNvbnN0IG5nMVZpZXdDb25maWc6IFZpZXdDb25maWcgPSA8YW55PihcbiAgICAgICAgbmV3IE5nMVZpZXdDb25maWcoPGFueT5wYXRoLCA8YW55Pk9iamVjdC5hc3NpZ24oe30sIGNvbmZpZywgeyAkdHlwZTogJ25nMScgfSksICR0ZW1wbGF0ZUZhY3RvcnkpXG4gICAgICApO1xuICAgICAgY29uc3QgbmcyVmlld0NvbmZpZzogVmlld0NvbmZpZyA9IDxhbnk+KFxuICAgICAgICBuZXcgTmcyVmlld0NvbmZpZyg8YW55PnBhdGgsIDxhbnk+T2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLCB7ICR0eXBlOiAnbmcyJyB9KSlcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBbbmcyVmlld0NvbmZpZywgbmcxVmlld0NvbmZpZ107XG4gICAgfSk7XG4gIH0sXG5dKTtcbiJdfQ==
