import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotesAddEditComponent } from './quotes-add-edit.component';

describe('QuotesAddEditComponent', () => {
  let component: QuotesAddEditComponent;
  let fixture: ComponentFixture<QuotesAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotesAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotesAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
