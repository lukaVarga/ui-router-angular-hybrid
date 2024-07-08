import * as i0 from '@angular/core';
import { Component, Inject, Input, Injector, NgModule } from '@angular/core';
import { getAngularJSGlobal, getAngularLib, UpgradeModule, downgradeComponent } from '@angular/upgrade/static';
import * as i1 from '@uirouter/core';
import { UIRouter, StateRegistry, Resolvable, forEach } from '@uirouter/core';
import * as i2 from '@uirouter/angular';
import {
  UIView,
  UIROUTER_MODULE_TOKEN,
  applyModuleConfig,
  makeChildProviders,
  UIRouterModule,
  UIROUTER_ROOT_MODULE,
  _UIROUTER_SERVICE_PROVIDERS,
  NATIVE_INJECTOR_TOKEN,
  ng2LazyLoadBuilder,
  Ng2ViewConfig,
} from '@uirouter/angular';
import { Ng1ViewConfig } from '@uirouter/angularjs';
import { UIRouterRx } from '@uirouter/rx';

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
const upgradeModule = angular.module('ui.router.upgrade', ['ui.router']);
function objectFactory() {
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
class UIViewNgUpgrade {
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
function uiRouterUpgradeFactory(router, injector) {
  const modules = injector.get(UIROUTER_MODULE_TOKEN, []);
  modules.forEach((module) => applyModuleConfig(router, injector, module));
  return router;
}
function getUIRouter($injector) {
  return $injector.get('$uiRouter');
}
function getParentUIViewInject(r) {
  return { fqn: null, context: r.root() };
}
/**
 * This NgModule should be added to the root module of the hybrid app.
 */
class UIRouterUpgradeModule {
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

/**
 * Generated bundle index. Do not edit.
 */

export {
  UIRouterUpgradeModule,
  UIViewNgUpgrade,
  getParentUIViewInject,
  getUIRouter,
  objectFactory,
  uiRouterUpgradeFactory,
  upgradeModule,
};
//# sourceMappingURL=uirouter-angular-hybrid.mjs.map
