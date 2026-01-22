import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NzMenuModule, NzIconModule],
  template: `
    <div class="logo-area">
      <h2>My Portfolio</h2>
    </div>
    @if (userAccount) {
      <div class="user-info">
        <div class="user-avatar">
          <span nz-icon nzType="user" nzTheme="outline"></span>
        </div>
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          @if (userRoles && userRoles.length > 0) {
            <div class="user-roles">
              @for (role of userRoles; track $index) {
                <div class="role-badge">{{ role }}</div>
              }
            </div>
          }
        </div>
      </div>
    }
    <ul nz-menu nzMode="inline" class="sider-menu">
      <li nz-menu-item nzMatchRouter>
        <a routerLink="/dashboard">
          <span nz-icon nzType="dashboard"></span>
          <span>Dashboard</span>
        </a>
      </li>
      <li nz-menu-item nzMatchRouter>
        <a routerLink="/budget">
          <span nz-icon nzType="form"></span>
          <span>Budget</span>
        </a>
      </li>
      <li nz-menu-item nzMatchRouter>
        <a routerLink="/investment-properties">
          <span nz-icon nzType="home"></span>
          <span>Investment Properties</span>
        </a>
      </li>
      <li nz-menu-item nzMatchRouter>
        <a routerLink="/other-investments">
          <span nz-icon nzType="line-chart"></span>
          <span>Other Investments</span>
        </a>
      </li>
      <li nz-menu-item nzMatchRouter>
        <a routerLink="/superannuation">
          <span nz-icon nzType="dollar"></span>
          <span>Superannuation</span>
        </a>
      </li>
      <li nz-menu-item nzMatchRouter>
        <a routerLink="/income-tracking">
          <span nz-icon nzType="wallet"></span>
          <span>Income Tracking</span>
        </a>
      </li>
    </ul>
    <div class="logout-section">
      <button class="logout-button" (click)="logout()">
        <span nz-icon nzType="logout" nzTheme="outline"></span>
        <span>Logout</span>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #fff;
      }
      .logo-area {
        height: 64px;
        padding: 16px;
        margin-bottom: 8px;
      }
      .logo-area h2 {
        margin: 0;
        color: #1890ff;
        font-size: 20px;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      .user-info {
        padding: 12px 16px;
        margin-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e6f7ff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .user-avatar span {
        font-size: 20px;
        color: #1890ff;
      }
      .user-details {
        flex: 1;
        min-width: 0;
      }
      .user-name {
        font-weight: 600;
        font-size: 14px;
        color: #262626;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .user-roles {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .role-badge {
        font-size: 11px;
        padding: 2px 8px;
        background: #f0f0f0;
        color: #595959;
        border-radius: 10px;
        white-space: nowrap;
      }
      .sider-menu {
        border-right: 0;
        flex: 1;
      }
      .logout-section {
        margin-top: auto;
        padding: 16px;
        border-top: 1px solid #f0f0f0;
      }
      .logout-button {
        width: 100%;
        padding: 10px 16px;
        border: none;
        background: #fff;
        color: #595959;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 4px;
        transition: all 0.3s;
      }
      .logout-button:hover {
        background: #f5f5f5;
        color: #ff4d4f;
      }
      .logout-button span[nz-icon] {
        font-size: 16px;
      }
    `,
  ],
})
export class NavMenuComponent implements OnInit {
  userAccount: AccountInfo | null = null;
  userName: string = '';
  userRoles: string[] = [];

  constructor(private authService: MsalService) {}

  ngOnInit(): void {
    this.userAccount = this.authService.instance.getAllAccounts()[0];

    if (this.userAccount) {
      // Get user name from the account
      this.userName = this.userAccount.name || this.userAccount.username || 'User';

      // Get roles from ID token claims
      // Roles can be in different claim types depending on your Azure AD configuration
      const idTokenClaims = this.userAccount.idTokenClaims as any;

      if (idTokenClaims) {
        // Check for roles in common claim locations
        this.userRoles =
          idTokenClaims.roles ||
          idTokenClaims.role ||
          idTokenClaims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          [];

        // Ensure userRoles is always an array
        if (typeof this.userRoles === 'string') {
          this.userRoles = [this.userRoles];
        }
      }
    }
  }

  logout(): void {
    this.authService.logoutRedirect({
      postLogoutRedirectUri: '/goodbye',
    });
  }
}
