import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bag, bagOutline, grid, gridOutline, location, locationOutline } from 'ionicons/icons';

/**
 * Component TabsLayoutComponent
 * @class TabsLayoutComponent
 *
 * @description
 * Application shell (layout): composes the bottom tab bar. Holds no business
 * logic — each tab lazy-loads its own feature.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-tabs-layout',
  templateUrl: 'tabs-layout.component.html',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsLayoutComponent {
  //#region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the tab bar icons.
   *
   * @access public
   * @since 1.0.0
   */
  public constructor() {
    addIcons({ grid, gridOutline, location, locationOutline, bag, bagOutline });
  }
  //#endregion
}
