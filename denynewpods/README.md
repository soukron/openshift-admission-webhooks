# Denynewpods
This Admission Webhook is an example of a _Validating Admission Webhook_ and will prevent running new pods (won't affect to existing running pods) in a namespace properly labeled.

## Webhook Server
### Description
The Webhook Server always returns the same JSON answer for all queries:
~~~
$ curl -k -X POST https://denynewpods.webhooks.svc
{
  "response": {
    "allowed": false,
    "status": {
      "status": "Failure",
      "message": "New pods denied.",
      "reason": "No new pods allowed in this project.",
      "code": 402
    }
  }
}
~~~

### Creating the Webhook Server
~~~
$ oc new-project webhooks
$ oc process -f https://raw.githubusercontent.com/soukron/openshift-admission-webhooks/master/denynewpods/templates/deployment.yaml \
  | oc apply -f -
$ oc start-build bc/denynewpods
~~~

## Admission Webhook
### Description
The Admission Webhook will trigger the Webhook Server when a new pod is created in a namespace labeled with the label `denynewpods.admission.online.openshift.io` to a value `enabled`.

### Creating the Admission Webhook
~~~
$ export WEBHOOK_CA_BUNDLE=$( sudo cat /etc/origin/master/service-signer.crt | base64 -w0 )
$ oc process -p WEBHOOK_NAMESPACE=webhooks \
     -p WEBHOOK_CA_BUNDLE=${WEBHOOK_CA_BUNDLE} \
     -f https://raw.githubusercontent.com/soukron/openshift-admission-webhooks/master/denynewpods/templates/webhookconfiguration.yaml \
  | oc apply -f -
~~~

## Customization
### Use your own certificates
After the Webhook Server is deployed and it's running, if you don't want to use the Service Signer CA certificates, replace the secret with your own cert/key pair and re-deploy the Webhook Server:
~~~
$ oc delete secret denynewpods-serving-cert
$ oc create secret tls denynewpods-serving-cert \
     --cert=my-custom-cert.cert \
     --key=my-custom-cert.key
$ oc rollout latest dc/denynewpods
~~~

Then proceed to modify the Admission Webhook with the CA which signed the previous certificate using the same commands:
~~~
$ export WEBHOOK_CA_BUNDLE=$( sudo cat my-custom-signer-ca.crt | base64 -w0 )
$ oc process -p WEBHOOK_NAMESPACE=webhooks \
     -p WEBHOOK_CA_BUNDLE=${WEBHOOK_CA_BUNDLE} \
     -f https://raw.githubusercontent.com/soukron/openshift-admission-webhooks/master/denynewpods/templates/webhookconfiguration.yaml \
  | oc apply -f -
~~~

## Testing
After the Webhook Server is deployed and the Admission Webhook has been created, try to create a new project and run a pod on it:
~~~
$ oc new-project test-webhooks
$ oc run sleep --image=alpine --command -- sleep 3600
~~~
This first pod will run successfully as the namespace is not yet labeled. 

Add the label to the namespace and try to increase the number of replicas:
~~~
$ oc label namespace test-webhooks denynewpods.admission.online.openshift.io=enabled
$ oc scale dc/sleep --replicas=5
~~~

No new pods will be scheduled and a log will appear in the events:
~~~
$ oc get events | grep admission
5m          5m           1         sleep-1.157e7b51cdc8c0fc          ReplicationController                                 Warning   FailedCreate                  replication-controller                    Error creating: admission webhook "denynewpods.admission.online.openshift.io" denied the request: New pods denied.
~~~

Remove the label to the namespace and this time the replicas will run:
~~~
$ oc label namespace test-webhooks denynewpods.admission.online.openshift.io-
$ oc scale dc/sleep --replicas=5
~~~

## Cleanup
Delete the Admission Webhook and then all resources labeled with the name of the Webhook Server:
~~~
$ oc delete validatingwebhookconfiguration denynewpods
$ oc delete all -n webhooks -l webhook=denynewpods
~~~

Remember to delete the secret if you used your custom certificates as it won't be deleted automatically:
~~~
$ oc delete secret denynewpods-serving-cert
~~~

## Contribute
Contact me if you want to help in creating new examples or you find any issue in the examples.
