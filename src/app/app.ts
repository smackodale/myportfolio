import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavMenuComponent, NzLayoutModule],
  template: `
    <nz-layout class="app-layout">
      @if (loginDisplay) {
        <nz-sider nzCollapsible nzWidth="200px" [nzTrigger]="null">
          <app-nav-menu></app-nav-menu>
        </nz-sider>
      }
      <nz-layout class="right-layout">
        <nz-content>
          <div class="inner-content">
            <router-outlet></router-outlet>
          </div>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
  styles: [
    `
      .app-layout {
        min-height: 100vh;
      }

      :host ::ng-deep .ant-layout-sider {
        overflow-y: auto;
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 10;
      }

      .right-layout {
        height: 100vh;
        overflow: hidden;
        transition: all 0.2s;
      }

      :host ::ng-deep .ant-layout-has-sider .right-layout {
        margin-left: 200px;
      }

      :host ::ng-deep nz-content {
        height: 100%;
        overflow-y: auto;
      }

      .inner-content {
        padding: 24px;
        min-height: 280px;
      }

      .login-prompt {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    `,
  ],
})
export class App implements OnInit, OnDestroy {
  title = 'MyPortfolio-Web';
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
  ) {}

  ngOnInit(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$),
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });

    this.setLoginDisplay();
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
