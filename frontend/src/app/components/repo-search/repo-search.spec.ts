import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoSearch } from './repo-search';

describe('RepoSearch', () => {
  let component: RepoSearch;
  let fixture: ComponentFixture<RepoSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepoSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(RepoSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
