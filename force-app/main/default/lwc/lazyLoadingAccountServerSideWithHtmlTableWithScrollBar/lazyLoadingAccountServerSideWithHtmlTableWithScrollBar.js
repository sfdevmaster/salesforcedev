/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccountsData';

export default class LazyLoadingAccountServerSideWithHtmlTableWithScrollBar extends LightningElement {
    @track accounts = [];
    @api pageSize = 5;
    offset = 0;
    isLoading = false;

    connectedCallback() {
        this.loadInitialData();
    }

    loadInitialData() {
        this.isLoading = true;
        getAccounts({ limitSize: this.pageSize, offset: this.offset })
            .then((result) => {
                // Pass initial offset as 0
                this.accounts = this.processAccounts(result, 0);
                this.offset += this.pageSize;
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
        this.isLoading = true;

        setTimeout(() => {
            getAccounts({ limitSize: this.pageSize, offset: this.offset })
                .then((result) => {
                    if (result.length > 0) {
                        // Adjust serial numbers
                        const newAccounts = this.processAccounts(result, this.accounts.length);
                        // Update array reference
                        this.accounts = [...this.accounts, ...newAccounts];
                        this.offset += this.pageSize;
                    }
                    this.isLoading = false;
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
            // Approximate height of each row in pixels
            const rowHeight = 35;
            // Total height based on pageSize
            const calculatedHeight = this.pageSize * rowHeight;
            scrollableContainer.style.height = `${calculatedHeight}px`;
        }
    }
}