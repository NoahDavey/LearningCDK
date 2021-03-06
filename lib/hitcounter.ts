import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

export interface HitCounterProps {
  downstream: lambda.IFunction
}

export class HitCounter extends cdk.Construct {

  public readonly handler: lambda.Function
  public readonly table: dynamodb.Table

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id)

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: {name: 'path', type: dynamodb.AttributeType.STRING}
    })

    this.table = table

    this.handler = new lambda.Function(this, 'HitCountHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName
      }
    })

    // Grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler)

    // Grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler)
  }
}