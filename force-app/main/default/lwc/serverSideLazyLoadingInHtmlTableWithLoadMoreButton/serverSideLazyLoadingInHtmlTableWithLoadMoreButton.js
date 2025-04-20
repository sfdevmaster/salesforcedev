/*serverSideLazyLoadingInHtmlTableWithLoadMoreButton.js*/
// Import necessary LWC modules and decorators
import { LightningElement, track, api } from 'lwc';
// Import Apex method for retrieving contact data
import getContacts from '@salesforce/apex/LazyLoadingContactController.getContactsData';

// Export the class to handle server-side lazy loading of contacts in an HTML table with a "Load More" button
export default class ServerSideLazyLoadingInHtmlTableWithLoadMoreButton extends LightningElement {
    // Reactive property to store contact records
    @track contacts = [];
    // Public property to define the number of records per page
    @api pageSize = 5;
    // Offset for pagination, keeps track of the starting point for the next batch of records
    offset = 0;
    // Boolean flag to track if data is being fetched
    isLoading = false;
    // Boolean flag to check if there are more records available to load
    hasMoreRecords = true;

    /**
     * Lifecycle hook invoked when the component is inserted into the DOM.
     * Calls the method to load the initial data.
     */
    connectedCallback() {
        this.loadInitialData();
    }

    /**
     * loadInitialData method fetches contact data from the server.
     * Prevents additional calls if no more records or already loading.
     * Handles server response and updates component state.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    async loadInitialData() {
        if (!this.hasMoreRecords || this.isLoading) return;

        this.isLoading = true; // Mark the start of data loading
        try {
            // Simulate a delay for loading to mimic real-time API behavior
            await this.loadingDelay();

            // Call the Apex method to fetch contact data
            const result = await getContacts({
                limitSize: this.pageSize,
                offset: this.offset
            });

            if (result.length > 0) {
                // Process the fetched contacts to add serial numbers
                const newContacts = this.processContacts(result, this.contacts.length);

                // Append the newly fetched contacts to the existing list
                this.contacts = [...this.contacts, ...newContacts];

                // Update the offset to fetch the next batch of records
                this.offset += this.pageSize;

                // Determine if there are more records to load
                this.hasMoreRecords = result.length === this.pageSize;
            } else {
                // No more records to fetch
                this.hasMoreRecords = false;
            }

            // Optionally update the scrollable container height
            // this.updateScrollableHeight();
        } catch (error) {
            // Log any errors encountered during data fetching
            console.error('Error loading more contacts:', error);
        } finally {
            // Mark the end of data loading
            this.isLoading = false;
        }
    }

    /**
     * loadingDelay method simulates a delay for data fetching.
     * @param {NA} - No parameters are accepted by this method.
     * @return {Promise} - Resolves after 1 second
     */
    loadingDelay() {
        // Simulate a network delay of 1 second
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        return new Promise((resolve) => setTimeout(resolve, 1000));
    }

    /**
     * handleLoadMore method triggers loading of the next set of data.
     * Also initializes scroll-related events for user interaction.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    async handleLoadMore() {
        this.loadInitialData();
        this.handleScrollEvent();
    }

    /**
     * handleScrollEvent method monitors window scroll events.
     * Displays or hides the "Back to Top" button based on scroll position.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    handleScrollEvent() {
        window.addEventListener('scroll', () => {
            const backToTopButton = this.template.querySelector('.back-to-top');
            // Show the button if the user has scrolled down, otherwise hide it
            if (window.scrollY > 20) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
    }

    /**
     * allLoaded getter checks if all records have been loaded.
     * @return {boolean} - True if all records are loaded, false otherwise.
     */
    get allLoaded() {
        // Returns true if there are no more records to load and at least one record is present
        return !this.hasMoreRecords && this.contacts.length > 0;
    }

    /**
     * processContacts method adds serial numbers to each contact record.
     * @param {Array} contacts - Array of contact records fetched from the server.
     * @param {number} currentLength - Current number of records in the contacts array.
     * @return {Array} - Processed array of contact records with serial numbers added.
     */
    processContacts(contacts, currentLength) {
        return contacts.map((contact, index) => ({
            ...contact,
            serialNumber: currentLength + index + 1,
        }));
    }

    /**
     * scrollToTop method scrolls the page back to the top.
     * Uses smooth scrolling for a better user experience.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * updateScrollableHeight method adjusts the height of the scrollable container.
     * Ensures the container height matches the total height of the rows.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    updateScrollableHeight() {
        const scrollableContainer = this.template.querySelector('.scrollable');
        if (scrollableContainer) {
            // Approximate height of each row
            const rowHeight = 34;
            const totalHeight = this.contacts.length * rowHeight;

            // Update the height of the scrollable container
            scrollableContainer.style.height = `${totalHeight}px`;
        }
    }
}