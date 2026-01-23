import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-nav-menu',
  imports: [CommonModule, RouterModule, NzMenuModule, NzIconModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavMenuComponent implements OnInit {
  private readonly authService = inject(MsalService);

  readonly userAccount = signal<AccountInfo | null>(null);

  readonly userName = computed(() => {
    const account = this.userAccount();
    return account ? account.name || account.username || 'User' : '';
  });

  readonly userRoles = computed<string[]>(() => {
    const account = this.userAccount();
    if (!account) return [];

    const idTokenClaims = account.idTokenClaims as any;
    if (!idTokenClaims) return [];

    let roles =
      idTokenClaims.roles ||
      idTokenClaims.role ||
      idTokenClaims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      [];

    return Array.isArray(roles) ? roles : [roles];
  });

  ngOnInit(): void {
    const account = this.authService.instance.getAllAccounts()[0];
    this.userAccount.set(account || null);
  }

  logout(): void {
    this.authService.logoutRedirect({
      postLogoutRedirectUri: '/goodbye',
    });
  }
}
