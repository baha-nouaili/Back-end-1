import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver , Query, Subscription } from '@nestjs/graphql';
import { Clients } from './clients.entity';
import { ClientsService } from './clients.service';
import { CreateClientsInput } from './dto/create-clients.input';
import { LoginClientsInput } from './dto/login-clients.input';
import { GqlAuthGuard } from '../guards/gql-auth.guards';
import { UserToken } from './userToken.entity';
import { CtxClient } from 'src/decoraters/ctx-user.decorator';
import { PubSub } from 'graphql-subscriptions';


const pubsub = new PubSub()

@Resolver(of => Clients)
export class ClientsResolver {
    constructor(private clientService : ClientsService) {} 
 
@Subscription(returns => String)
  me(){
   return pubsub.asyncIterator('commentAdded');
}

  @Mutation(()=>Clients)
  register(@Args('createClientInput') createClientsInput : CreateClientsInput ) : Promise<Clients>  {
      pubsub.publish('userAdded!' , { userAdded : createClientsInput })
    console.log(createClientsInput)
        return this.clientService.register(createClientsInput) 
  }


  @Subscription(()=>Clients)
  userAdded(){
    return pubsub.asyncIterator('userAdded!')
  }


  @UseGuards(GqlAuthGuard)
    @Query(()=>Clients)
    getClients(@CtxClient() client : Clients ){
      return this.clientService.findClientById(client.id) 
    }


   @Mutation(()=>UserToken)
   login(@Args('loginClientsInput') loginClientsInput : LoginClientsInput) : Promise<UserToken> {
           return this.clientService.login(loginClientsInput) ; 
   }

}

