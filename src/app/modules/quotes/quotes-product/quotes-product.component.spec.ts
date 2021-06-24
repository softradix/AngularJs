import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotesProductComponent } from './quotes-product.component';

describe('QuotesProductComponent', () => {
  let component: QuotesProductComponent;
  let fixture: ComponentFixture<QuotesProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotesProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotesProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
