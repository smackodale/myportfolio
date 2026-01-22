import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { PropertySummary } from '../../../../models/investment-property.model';

@Component({
  selector: 'app-property-summary',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzGridModule, NzStatisticModule],
  template: `
    <div class="summary-section" [class.planned]="isPlanned">
      <h2>{{ title }}</h2>
      <div nz-row [nzGutter]="16">
        <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="6">
          <nz-card [class.planned-card]="isPlanned">
            <nz-statistic
              nzTitle="Total Property Value"
              [nzValue]="
                (summary?.totalPropertyValue || 0 | currency: 'AUD' : 'symbol-narrow' : '1.0-0') ||
                ''
              "
              [nzValueStyle]="getValueStyle(isPlanned ? '#595959' : '#3f8600')"
            ></nz-statistic>
          </nz-card>
        </div>
        <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="6">
          <nz-card [class.planned-card]="isPlanned">
            <nz-statistic
              nzTitle="Total Financed Amount"
              [nzValue]="
                (summary?.totalFinancedAmount || 0 | currency: 'AUD' : 'symbol-narrow' : '1.0-0') ||
                ''
              "
              [nzValueStyle]="getValueStyle(isPlanned ? '#595959' : '#cf1322')"
            ></nz-statistic>
          </nz-card>
        </div>
        <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="6">
          <nz-card [class.planned-card]="isPlanned">
            <nz-statistic
              nzTitle="Total Equity"
              [nzValue]="
                (summary?.totalEquity || 0 | currency: 'AUD' : 'symbol-narrow' : '1.0-0') || ''
              "
              [nzValueStyle]="getValueStyle(isPlanned ? '#595959' : '#1890ff')"
            ></nz-statistic>
          </nz-card>
        </div>
        <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="6">
          <nz-card [class.planned-card]="isPlanned">
            <nz-statistic
              nzTitle="Total Usable Equity"
              [nzValue]="
                (summary?.totalUsableEquity || 0 | currency: 'AUD' : 'symbol-narrow' : '1.0-0') ||
                ''
              "
              [nzValueStyle]="getValueStyle(isPlanned ? '#595959' : '#722ed1')"
            ></nz-statistic>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .summary-section {
        margin-bottom: 32px;
      }

      .summary-section.planned {
        margin-top: 48px;
        padding-top: 32px;
        border-top: 2px dashed #d9d9d9;
      }

      .summary-section h2 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #262626;
      }

      .summary-section.planned h2 {
        color: #595959;
      }

      .planned-card {
        background: #fafafa;
      }

      :host ::ng-deep .ant-statistic-content-value {
        font-weight: 600;
      }
    `,
  ],
})
export class PropertySummaryComponent {
  @Input() summary: PropertySummary | null = null;
  @Input() title: string = '';
  @Input() isPlanned: boolean = false;

  getValueStyle(color: string): { [key: string]: string } {
    return { color };
  }
}
