/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccountsData';

export default class LazyLoadingAccountServerSideWithHtmlTableWithScrollBar extends LightningElement {
  @track accounts = [];
  @api limit = 4;
  offset = 0;
  isLoading = false;

  connectedCallback() {
    this.loadInitialData();
  }

  loadInitialData() {
    debugger;
    this.isLoading = true;
    getAccounts({ limitSize: this.limit, offset: this.offset })
      .then((result) => {
        this.accounts = this.processAccounts(result, 0); // Pass initial offset as 0
        this.offset += this.limit;
        this.isLoading = false;
        this.setScrollableHeight();

      })
      .catch((error) => {
        console.error('Error loading accounts:', error);
        this.isLoading = false;
      });
  }

  loadMoreData() {
    if (this.isLoading) return;
    debugger;
    this.isLoading = true;

    setTimeout(() => {
      getAccounts({ limitSize: this.limit, offset: this.offset })
        .then((result) => {
          if (result.length > 0) {
            // Adjust serial numbers
            const newAccounts = this.processAccounts(result, this.accounts.length);
            // Update array reference
            this.accounts = [...this.accounts, ...newAccounts];
            this.offset += this.limit;
          }
          this.isLoading = false;

          // Update scrollable height after loading more data
          //this.setScrollableHeight();
        })
        .catch((error) => {
          console.error('Error loading more accounts:', error);
          this.isLoading = false;
        });
    }, 1000);
  }

  processAccounts(accounts, currentLength) {
    // Add serial number to each account
    return accounts.map((account, index) => ({
      ...account,
      serialNumber: currentLength + index + 1, // Calculate serial number
    }));
  }

  handleScroll() {
    const buffer = 10;
    const scrollableContainer = this.template.querySelector('.scrollable');

    if (!scrollableContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;

    if (scrollHeight - scrollTop - clientHeight < buffer && !this.isLoading) {
      this.loadMoreData();
    }

    const backToTopButton = this.template.querySelector('.back-to-top');
    if (scrollTop > 20) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  }

  scrollToTop() {
    const scrollableContainer = this.template.querySelector('.scrollable');
    if (scrollableContainer) {
      scrollableContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  setScrollableHeight() {
    const scrollableContainer = this.template.querySelector('.scrollable');
    if (scrollableContainer) {
      const rowHeight = 30; // Approximate height of each row in pixels
      const calculatedHeight = this.limit * rowHeight; // Total height based on limit
      scrollableContainer.style.height = `${calculatedHeight}px`;
    }
  }
}