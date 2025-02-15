// Import necessary modules and mixins
import { LightningElement, wire } from "lwc";
// Provides access to the current page's state
import { CurrentPageReference } from "lightning/navigation";
// Used for showing toast notifications
import { ShowToastEvent } from "lightning/platformShowToastEvent";
// NavigationMixin to enable navigation in Salesforce Lightning
import { NavigationMixin } from "lightning/navigation";
 
export default class UpdateMultipleLeads extends NavigationMixin(LightningElement) {
 
    // Holds the array of selected lead record IDs
    leadIds = [];
    // Boolean to check if valid leads exist
    validLeadExists;
 
    // Wire method to get current page state parameters
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            // Extract record IDs passed as state parameter
            const recordIds = currentPageReference.state.c__recordIds;
            // Check if there are valid leads
            this.validLeadExists = recordIds?.length > 0;
            if (recordIds) {
                // Decode and split record IDs into an array
                this.leadIds = decodeURIComponent(recordIds).split(",");
            }
        }
    }
 
    /**
     * Utility method to show toast notifications
     * @param {string} title - Title of the toast
     * @param {string} message - Message body of the toast
     * @param {string} variant - Type of toast (success, error, warning)
     */
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        // Dispatch the toast event
        this.dispatchEvent(evt);
    }
 
    /**
     * Redirects user to the Lead list view
     */
    redirectToListView() {
        this[NavigationMixin.Navigate]({
            // Standard navigation type
            type: "standard__objectPage",
            attributes: {
                // Redirect to Lead object
                objectApiName: "Lead",
                // Go to list view
                actionName: "list",
                state: {
                    // Apply Recent filter in the list view
                    filterName: "Recent",
                },
            },
        });
    }
 
    /**
     * Handles the submission of updates for multiple lead records
     */
    handleUpdateAll() {
        debugger;
        // Select all record-edit forms
        const forms = this.template.querySelectorAll("lightning-record-edit-form");
        // Array to hold promises for form submissions
        const updatePromises = [];
 
        // Iterate over each form and create a Promise for its submission
        forms.forEach((form) => {
            const promise = new Promise((resolve, reject) => {
                // Resolve on success
                form.addEventListener("success", () => resolve());
                // Reject on error with message
                form.addEventListener("error", (event) => reject(event.detail.message));
                // Submit the form
                form.submit();
            });
            updatePromises.push(promise); // Add the promise to the array
        });
 
        // Wait for all forms to complete submission (success or failure)
        Promise.allSettled(updatePromises).then((results) => {
            const errors = results
                // Filter out rejected promises
                .filter((result) => result.status === "rejected")
                // Collect error messages
                .map((result) => result.reason);
 
            // Count successful updates
            const successCount = results.filter((result) => result.status === "fulfilled").length;
 
            if (errors.length > 0) {
                // Show a partial success toast if there are errors
                this.showToast(
                    "Partial Success",
                    `Updated ${successCount} leads. Errors occurred: ${errors.join(", ")}`,
                    "warning"
                );
            } else {
                // Show a success toast if all updates succeed
                this.showToast("Success", "All leads updated successfully!", "success");
                // Redirect to the lead list view
                this.redirectToListView();
            }
        });
    }
}