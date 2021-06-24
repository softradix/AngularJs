import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotesProponentComponent } from './quotes-proponent.component';

describe('QuotesProponentComponent', () => {
  let component: QuotesProponentComponent;
  let fixture: ComponentFixture<QuotesProponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotesProponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotesProponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
