<script lang="ts">
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import {alertState, type AlertPrimitive} from "./alert-primitive.store";
    import {Btn} from "$lib/components/osai/button/index.js";

    let alert : AlertPrimitive = $state({});
    let loading: boolean = $state(false);

    alertState.subscribe(v => {
        alert = v;

        alert?.loading?.subscribe(v => loading = v);
    });

    function close() {
        alertState.set({ ...alert, open: false });
    }

</script>

<AlertDialog.Root open={alert.open}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>{alert.title ?? "Continue Action?"}</AlertDialog.Title>
            <AlertDialog.Description>
                {@html alert.message ?? "The action you are about to perform may be irreversible!"}
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <Btn variant="outline" onclick={close}>{alert.cancelText ?? "Cancel"}</Btn>
            <Btn {loading} loadingText="Processing..." onclick={() => {
                alert.onDone?.(close).then(() => {
                    if(alert.closeOnDone)
                        close();
                });
            }}>{alert.okText ?? "Continue"}</Btn>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>