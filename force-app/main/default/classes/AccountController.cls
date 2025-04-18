// AccountController.cls
public with sharing class AccountController {

    // Method to get accounts data based on a field set
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountsData(Integer limitSize, Integer offset) {
        // Query accounts using the specified field set
        return [
            SELECT Id, Name, Industry 
            FROM Account 
            ORDER BY Name 
            LIMIT :limitSize 
            OFFSET :offset
        ];
    }
}