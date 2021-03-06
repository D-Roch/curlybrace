package models

import org.joda.time._
import helpers.Constant._
import helpers.TypeMapper._
import helpers.VoteType._
import helpers.PostType._
import slick.driver.PostgresDriver.simple._

/**
 * Copyright (c) 2013 JeongHoon Byun aka "Outsider", <http://blog.outsider.ne.kr/>
 * Licensed under the MIT license.
 * <http://outsider.mit-license.org/>
 *
 * Author: Outsider
 * Date: 13. 6. 8.
 * Time: 오후 7:10
 */
case class Vote(
  targetId: Int,
  targetType: PostType,
  userId: Int,
  voteType: VoteType,
  createdAt: DateTime = DateTime.now
)

object Votes extends Table[Vote](TablePrefix + "_votes") {
  def targetId = column[Int]("target_id", O.NotNull)
  def targetType = column[PostType]("target_type", O.NotNull)
  def userId = column[Int]("user_id", O.NotNull)
  def voteType = column[VoteType]("vote_type", O.NotNull)
  def createdAt = column[DateTime]("createdAt", O.NotNull)
  def * = targetId ~ targetType ~ userId ~ voteType ~ createdAt <> (Vote, Vote.unapply _)
  def pk = primaryKey("pk_votes", targetId ~ targetType ~ userId)

  def add(vote: Vote)(implicit session: Session) = {
    Votes.insert(vote)
    vote.targetType match {
      case QuestionType if vote.voteType == UpVote => Questions.upVote(vote.targetId)
      case QuestionType if vote.voteType == DownVote => Questions.downVote(vote.targetId)
      case AnswerType if vote.voteType == UpVote => Answers.upVote(vote.targetId)
      case AnswerType if vote.voteType == DownVote => Answers.downVote(vote.targetId)
    }
    vote
  }

  def findByQuestionId(questionId: Int)(implicit session: Session) = {
    (for {
      vote <- Votes
      if vote.targetId === questionId
      if vote.targetType === QuestionType
    } yield vote).list
  }

  def findByAnswerId(answerId: Int)(implicit session: Session) = {
    (for {
      vote <- Votes
      if vote.targetId === answerId
      if vote.targetType === AnswerType
    } yield vote).list
  }

  def remove(vote: Vote)(implicit session: Session) = {
    val removedRowCount = (for {
        v <- Votes
        if v.targetId === vote.targetId
        if v.targetType === vote.targetType
        if v.userId === vote.userId
        if v.voteType === vote.voteType
      } yield v).delete

    if (removedRowCount > 0)
      vote.targetType match {
        case QuestionType if vote.voteType == UpVote => Questions.upVote(vote.targetId, -1)
        case QuestionType if vote.voteType == DownVote => Questions.downVote(vote.targetId, -1)
        case AnswerType if vote.voteType == UpVote => Answers.upVote(vote.targetId, -1)
        case AnswerType if vote.voteType == DownVote => Answers.downVote(vote.targetId, -1)
      }
  }

}

