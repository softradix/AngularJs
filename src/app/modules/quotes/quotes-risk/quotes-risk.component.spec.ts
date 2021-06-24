import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotesRiskComponent } from './quotes-risk.component';

describe('QuotesRiskComponent', () => {
  let component: QuotesRiskComponent;
  let fixture: ComponentFixture<QuotesRiskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotesRiskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotesRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
