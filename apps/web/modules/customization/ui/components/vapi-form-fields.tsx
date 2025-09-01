import { FieldValues, UseFormReturn } from "react-hook-form";
import { useVapiAssistants, useVapiPhoneNumbers } from "@/modules/plugins/hooks/use-vapi-data";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { FormSchema } from "../../constants";

interface VapiFormFieldsProps {
    form: UseFormReturn<FormSchema>;
}

export const VapiFormFields = ({ form }: VapiFormFieldsProps) => {
    const { data: assistants, isLoading: assistantsLoading } = useVapiAssistants();
    const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useVapiPhoneNumbers();
    const disabled = form.formState.isSubmitting;

    return (
        <>
            <FormField
                control={form.control}
                name="vapiSettings.assistantId"
                render={({ field }: { field: FieldValues }) => (
                    <FormItem>
                        <FormLabel>Voice Assistant</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={assistantsLoading || disabled}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        assistantsLoading
                                            ? "Loading assistants..."
                                            : "Select an Assistant"
                                    } />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {assistants.map((assistant) => (
                                    <SelectItem key={assistant.id} value={assistant.id}>{assistant.name || "Unnamed Assistant"} -{" "}{assistant.model?.model || "Unknown model"}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormDescription>Vapi Assistant to use for voice calls</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="vapiSettings.phoneNumber"
                render={({ field }: { field: FieldValues }) => (
                    <FormItem>
                        <FormLabel>Phone Numbers</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={phoneNumbersLoading || disabled}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        phoneNumbersLoading
                                            ? "Loading Phone numbers..."
                                            : "Select a Phone number"
                                    } />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {phoneNumbers.map((number) => (
                                    <SelectItem key={number.id} value={number.id}>{number.number || "Unknown"} -{" "}{number.name || "Unnamed"}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormDescription>Phone number to display in the Widget</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}