# Enforceenv
This Admission Webhook is an example of a _Mutating Admission Webhook_ and will add environment variables to pods according to a label in the namespace where they run.

## Webhook Server
### Description
The Webhook Server will:
- read a list of environment variables from a label `enforceenv.admission.online.openshift.io` in the namespace.
- process the pod definition to ensure that the expected variables are defined. Otherwise it will add them.
- return a JSON with the mutated object

### Creating the Webhook Server
~~~
$ oc new-project webhooks
$ oc process -p WEBHOOK_NAMESPACE=webhooks \
     -f https://raw.githubusercontent.com/soukron/openshift-admission-webhooks/master/enforceenv/templates/deployment.yaml \
  | oc apply -f -
$ oc start-build bc/enforceenv
~~~

## Admission Webhook
### Description
The Admission Webhook will trigger the Webhook Server when a new pod is created in a namespace labeled with the label `enforceenv.admission.online.openshift.io` is set.

### Creating the Admission Webhook
#### OpenShift 3.x
~~~
$ export WEBHOOK_CA_BUNDLE=$( sudo cat /etc/origin/master/service-signer.crt | base64 -w0 )
$ oc process -p WEBHOOK_NAMESPACE=webhooks \
     -p WEBHOOK_CA_BUNDLE=${WEBHOOK_CA_BUNDLE} \
     -f https://raw.githubusercontent.com/soukron/openshift-admission-webhooks/master/enforceenv/templates/webhookconfiguration.yaml \
  | oc apply -f -
~~~

#### OpenShift 4.x
~~~
$ export WEBHOOK_CA_BUNDLE=$( oc get configmap -n openshift-network-operator openshift-service-ca -o jsonpath='{.data.service-ca\.crt}' | base64 -w0 )
$ oc process -p WEBHOOK_NAMESPACE=webhooks \
     -p WEBHOOK_CA_BUNDLE=${WEBHOOK_CA_BUNDLE} \
     -f https://raw.githubusercontent.com/soukron/openshift-admission-webhooks/master/enforceenv/templates/webhookconfiguration.yaml \
  | oc apply -f -
~~~

## Customization
### Use your own certificates
After the Webhook Server is deployed and it's running, if you don't want to use the Service Signer CA certificates, replace the secret with your own cert/key pair and re-deploy the Webhook Server:
~~~
$ oc delete secret enforceenv-serving-cert
$ oc create secret tls enforceenv-serving-cert \
     --cert=my-custom-cert.cert \
     --key=my-custom-cert.key
$ oc rollout latest dc/enforceenv
~~~

Then proceed to modify the Admission Webhook with the CA which signed the previous certificate using the same commands:
~~~
$ export WEBHOOK_CA_BUNDLE=$( sudo cat my-custom-signer-ca.crt | base64 -w0 )
$ oc process -p WEBHOOK_NAMESPACE=webhooks \
     -p WEBHOOK_CA_BUNDLE=${WEBHOOK_CA_BUNDLE} \
     -f https://raw.githubusercontent.com/soukron/openshift-admission-webhooks/master/enforceenv/templates/webhookconfiguration.yaml \
  | oc apply -f -
~~~

## Testing
After the Webhook Server is deployed and the Admission Webhook has been created, create a new project and run a pod on it:
~~~
$ oc new-project test-webhooks
$ oc run env --restart=Never --attach=true --rm=true \
     --image=alpine --command -- env
~~~
This first pod will run and will show its environment variables.

Add an annotation to the namespace with a example variable and run the pod again.
~~~
$ oc annotate namespace test-webhooks enforceenv.admission.online.openshift.io/env={\"HTTP_PROXY\":\"http://192.168.2.1:8080\"}
$ oc run env --restart=Never --attach=true --rm=true \
     --image=alpine --command -- env
~~~

The new pod execution will include the variables in the annotation. If a variable is already included in the pod it won't be added.

Remove the annotation to the namespace and this time the variable will be gone:
~~~
$ oc annotate namespace test-webhooks enforceenv.admission.online.openshift.io/env-
$ oc run env --restart=Never --attach=true --rm=true \
     --image=alpine --command -- env
~~~

## Cleanup
Delete the Admission Webhook and then all resources labeled with the name of the Webhook Server:
~~~
$ oc delete validatingwebhookconfiguration enforceenv
$ oc delete all -n webhooks -l webhook=enforceenv
~~~

Remember to delete the secret if you used your custom certificates as it won't be deleted automatically:
~~~
$ oc delete secret enforceenv-serving-cert
~~~

## Contribute
Contact me if you want to help in creating new examples or you find any issue in the examples.
