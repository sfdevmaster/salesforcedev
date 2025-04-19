
/*serverSideLazyLoadingInDataTableWithLoadMoreButton.js*/
import { LightningElement, track, api } from 'lwc';
import getAccounts from '@salesforce/apex/LazyLoadingAccountController.getAccountsData';

const COLUMNS = [
    {
        label: 'Account Name',
        fieldName: 'Name',
        type: 'text',
        sortable: false,
        hideDefaultActions: true,
    },
    {
        label: 'Industry',
        fieldName: 'Industry',
        type: 'text',
        sortable: false,
        hideDefaultActions: true,
    }
];

export default class ServerSideLazyLoadingInDataTableWithLoadMoreButton extends LightningElement {
    @track accounts = [];
    @track columns = COLUMNS;
    @api pageSize = 5;
    offset = 0;
    isLoading = false;
    hasMoreRecords = true;

    connectedCallback() {
        this.loadData();
    }

    async loadData() {
        if (!this.hasMoreRecords || this.isLoading) return;
        this.isLoading = true;
        // Simulate a delay for loading
        await this.loadingDelay();
        const result = await getAccounts({ limitSize: this.pageSize, offset: this.offset });
        if (result.length > 0) {
            this.accounts = [...this.accounts, ...result];
            this.offset += this.pageSize;
            this.hasMoreRecords = result.length === this.pageSize;
            this.isLoading = false;
        } else {
            this.hasMoreRecords = false;
            this.isLoading = false;
        }
    }

    loadingDelay() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        return new Promise((resolve) => setTimeout(resolve, 1000));
    }

    handleLoadMore() {
        this.loadData();
        this.handleScrollEvent();
    }

    handleScrollEvent() {
        window.addEventListener('scroll', () => {
            const backToTopButton = this.template.querySelector('.back-to-top');
            if (window.scrollY > 20) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
    }

    get allLoaded() {
        return !this.hasMoreRecords && this.accounts.length > 0;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
